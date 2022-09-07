package organisation

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/application"
	"github.com/factly/kavach-server/util/user"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// details - Get organisation by id
// @Summary Show a organisation by id
// @Description Get organisation by ID
// @Tags Organisation
// @ID get-organisation-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Success 200 {object} orgWithRole
// @Router /organisations/{organisation_id} [get]
func details(w http.ResponseWriter, r *http.Request) {
	organisationID := chi.URLParam(r, "organisation_id")
	id, err := strconv.Atoi(organisationID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}
	var permission model.OrganisationUser

	userID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	// VERIFY WHETHER THE USER IS PART OF ORGANISATION OR NOT
	isAuthorised, err := user.IsUserAuthorised(
		"organisations",
		fmt.Sprintf("org:%d", id),
		fmt.Sprintf("%d", userID),
	)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}
	if !isAuthorised {
		loggerx.Error(errors.New("user is not part of the organisation"))
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	err = model.DB.Model(&model.OrganisationUser{}).Where(&model.OrganisationUser{
		UserID:         uint(userID),
		OrganisationID: uint(id),
	}).First(&permission).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	organisation := &model.Organisation{}
	organisation.ID = uint(id)

	err = model.DB.Model(&model.Organisation{}).Preload("Medium").Preload("Applications").Preload("OrganisationUsers").Preload("OrganisationUsers.User").Preload("Roles").Preload("Roles.Users").Preload("Policies").Preload("Policies.Roles").Preload("Policies.Roles.Users").First(&organisation).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	applications := make([]model.Application, 0)
	model.DB.Model(&model.Application{}).Preload("Medium").Where(&model.Application{
		OrganisationID: uint(id),
	}).Find(&applications)

	result := orgWithRole{}

	result.Organisation = *organisation
	result.Permission = permission
	result.AllApplications = applications
	defaultApps, err := application.GetDefaultApplicationByOrgID(uint(userID), uint(id))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	result.AllApplications = append(result.AllApplications, defaultApps...)
	renderx.JSON(w, http.StatusOK, result)
}
