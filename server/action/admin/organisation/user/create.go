package user

// userContext is imported from route.go

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

type invites struct {
	// flag to send email or not, default is true
	SendEmail bool     `json:"send_email"`
	Users     []invite `json:"users"`
}

type invite struct {
	FirstName string `gorm:"column:first_name" json:"first_name" validate:"required"`
	LastName  string `gorm:"column:last_name" json:"last_name"`
	Email     string `json:"email" validate:"required"`
	Role      string `json:"role" validate:"required"`
}

// create - Create organisation user (admin)
// @Summary Create organisation user (admin)
// @Description Create organisation user (admin)
// @Tags AdminOrganisationUser
// @ID add-admin-organisation-user
// @Consume json
// @Produce json
// @Param X-KAVACH-MASTER-KEY header string true "Master Key"
// @Param organisation_id path string true "Organisation ID"
// @Param Invite body invites true "Invite Object"
// @Success 201 {array} userWithPermission
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

	// FindOrCreate invitee
	req := invites{SendEmail: false}
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}
	for _, user := range req.Users {
		validationError := validationx.Check(user)
		if validationError != nil {
			loggerx.Error(errors.New("validation error"))
			errorx.Render(w, validationError)
			return
		}
	}

	for _, user := range req.Users {
		tx := model.DB.WithContext(context.WithValue(r.Context(), userContext, 0)).Begin()
		invitee := model.User{
			Email:     user.Email,
			FirstName: user.FirstName,
			LastName:  user.LastName,
		}

		err = tx.Where(&model.User{
			Email: invitee.Email,
		}).First(&invitee).Error

		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}

		// Check if user already exists in organisation
		var totPermissions int64
		permission := &model.OrganisationUser{}
		permission.OrganisationID = uint(orgID)
		permission.UserID = invitee.ID

		tx.Model(&model.OrganisationUser{}).Where(permission).Count(&totPermissions)
		if totPermissions != 0 {
			tx.Rollback()
			loggerx.Error(errors.New("user already exists in organisation"))
			continue
		}

		// Create organisation user entry
		orgUser := &model.OrganisationUser{
			UserID:         invitee.ID,
			OrganisationID: uint(orgID),
			Role:           user.Role,
		}

		// Creating a relation tuple for users in keto api
		tuple := &model.KetoRelationTupleWithSubjectID{
			KetoSubjectSet: model.KetoSubjectSet{
				Namespace: "organisations",
				Object:    fmt.Sprintf("org:%d", orgID),
				Relation:  user.Role,
			},
			SubjectID: fmt.Sprintf("%d", invitee.ID),
		}

		err = keto.CreateRelationTupleWithSubjectID(tuple)
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}

		// Adding user to organisation
		err = tx.Model(&model.OrganisationUser{}).Create(orgUser).Error
		if err != nil {
			loggerx.Error(err)
			tx.Rollback()
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}

		tx.Commit()
	}
	renderx.JSON(w, http.StatusOK, nil)
}
