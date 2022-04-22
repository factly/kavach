package user

import (
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// list - Get all role uses
// @Summary Show all role users
// @Description Get all role users
// @Tags OrganisationRoleUsers
// @ID get-all-organisation-role-users
// @Produce json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Success 200 {array} model.Application
// @Router /organisations/{organisation_id}/roles/{role_id}/users [get]
func list(w http.ResponseWriter, r *http.Request) {
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

	rID := chi.URLParam(r, "role_id")
	roleID, err := strconv.Atoi(rID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}
	// Check if user is part of organisation
	permission := &model.OrganisationUser{}
	err = model.DB.Model(&model.OrganisationUser{}).Where(&model.OrganisationUser{
		OrganisationID: uint(orgID),
		UserID:         uint(userID),
	}).First(permission).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// get role using role id
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

	// send JSON response
	renderx.JSON(w, http.StatusAccepted, orgRole.Users)
}
