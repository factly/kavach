package user

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
)

type requestModel struct {
	UserID int `json:"user_id" validate:"required"`
}

// create - add a user to the organisation role
// @Summary add a user to the organisation role
// @Description create organisation role user
// @Tags ApplicationRoleUsers
// @ID create-a-organisation-role-users
// @Produce json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Success 200 nil
// @Router /organisations/{organisation_id}/roles/{role_id}/users [post]
func create(w http.ResponseWriter, r *http.Request) {
	userID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	organisationID := chi.URLParam(r, "organisation_id")
	orgID, err := strconv.Atoi(organisationID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// get role-id from the path parameter
	rID := chi.URLParam(r, "role_id")
	roleID, err := strconv.Atoi(rID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// check whether user is owner in the organisation or not
	err = util.CheckOwner(uint(userID), uint(orgID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// decoding the requestBody
	userReqModel := &requestModel{}
	err = json.NewDecoder(r.Body).Decode(&userReqModel)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(userReqModel)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	// getting the organisation role
	orgRole := new(model.OrganisationRole)
	err = model.DB.Model(&model.OrganisationRole{}).Where(&model.OrganisationRole{
		Base: model.Base{
			ID: uint(roleID),
		},
		OrganisationID: uint(orgID),
	}).Preload("Users").Find(orgRole).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	users := make([]model.User, 0)
	users = append(orgRole.Users, model.User{Base: model.Base{ID: uint(userReqModel.UserID)}})
	orgRole.Users = users
	err = model.DB.Model(&model.OrganisationRole{}).Where(&model.OrganisationRole{
		Base: model.Base{
			ID: uint(roleID),
		},
		OrganisationID: uint(orgID),
	}).Association("Users").Replace(&users)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusOK, nil)
}
