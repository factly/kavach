package user

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	keto "github.com/factly/kavach-server/util/keto/relationTuple"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
)

// maxUsersPerRequest bounds how many users a single request can add
const maxUsersPerRequest = 50

type addUsers struct {
	Users []addUser `json:"users" validate:"required,min=1,dive"`
}

type addUser struct {
	Email string `json:"email" validate:"required,email"`
	Role  string `json:"role" validate:"required,oneof=owner member"`
}

// create - Add existing users to an organisation (admin)
// @Summary Add users to organisation (admin)
// @Description Add existing users to an organisation by email. Users that are already members are skipped.
// @Tags AdminOrganisationUser
// @ID add-admin-organisation-user
// @Consume json
// @Produce json
// @Param X-KAVACH-MASTER-KEY header string true "Master Key"
// @Param organisation_id path string true "Organisation ID"
// @Param Users body addUsers true "Users to add"
// @Success 201 {array} model.OrganisationUser
// @Failure 400 {array} string
// @Router /admin/organisations/{organisation_id}/users [post]
func create(w http.ResponseWriter, r *http.Request) {
	organisationID := chi.URLParam(r, "organisation_id")
	orgID, err := strconv.Atoi(organisationID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	req := addUsers{}
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}
	if len(req.Users) > maxUsersPerRequest {
		loggerx.Error(fmt.Errorf("cannot add more than %d users per request", maxUsersPerRequest))
		errorx.Render(w, errorx.Parser(errorx.GetMessage(fmt.Sprintf("cannot add more than %d users per request", maxUsersPerRequest), http.StatusUnprocessableEntity)))
		return
	}
	validationError := validationx.Check(req)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	err = model.DB.First(&model.Organisation{}, orgID).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	// Resolve every email before writing anything, so an unknown user fails the
	// whole request instead of leaving it half applied
	users := make([]model.User, len(req.Users))
	for i, u := range req.Users {
		err = model.DB.Where(&model.User{Email: u.Email}).First(&users[i]).Error
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.GetMessage(fmt.Sprintf("user with email %s not found", u.Email), http.StatusNotFound)))
			return
		}
	}

	result := make([]model.OrganisationUser, 0, len(req.Users))
	for i, u := range req.Users {
		orgUser, err := addToOrganisation(r.Context(), uint(orgID), users[i].ID, u.Role)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
		if orgUser != nil {
			result = append(result, *orgUser)
		}
	}

	renderx.JSON(w, http.StatusCreated, result)
}

// addToOrganisation makes userID a member of orgID with the given role. It
// returns nil without error when the user is already in the organisation.
func addToOrganisation(ctx context.Context, orgID, userID uint, role string) (*model.OrganisationUser, error) {
	tx := model.DB.WithContext(context.WithValue(ctx, userContext, 0)).Begin()
	defer tx.Rollback()

	var count int64
	err := tx.Model(&model.OrganisationUser{}).Where(&model.OrganisationUser{
		OrganisationID: orgID,
		UserID:         userID,
	}).Count(&count).Error
	if err != nil {
		return nil, err
	}
	if count != 0 {
		loggerx.Error(fmt.Errorf("user %d already exists in organisation %d", userID, orgID))
		return nil, nil
	}

	orgUser := &model.OrganisationUser{
		UserID:         userID,
		OrganisationID: orgID,
		Role:           role,
	}
	err = tx.Create(orgUser).Error
	if err != nil {
		return nil, err
	}

	tuple := orgTuple(orgID, userID, role)
	err = keto.CreateRelationTupleWithSubjectID(tuple)
	if err != nil {
		return nil, err
	}

	err = tx.Commit().Error
	if err != nil {
		// the membership row is gone, so the grant must go too
		revoke(tuple)
		return nil, err
	}

	return orgUser, nil
}
