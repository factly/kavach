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

type appUsers struct {
	Application model.Application `json:"application"`
	Users       []model.User      `json:"users"`
}

// list - Get all applications users
// @Summary Show all applications users
// @Description Get all applications users
// @Tags ApplicationUser
// @ID get-all-applications-users
// @Produce json
// @Param X-User header string true "User ID"
// @Param application_id path string true "Application ID"
// @Param organisation_id path string true "Organisation ID"
// @Success 200 {array} []appUsers
// @Router /organisations/{organisation_id}/applications/{application_id}/users [get]
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

	applicationID := chi.URLParam(r, "application_id")
	appID, err := strconv.Atoi(applicationID)
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

	result := &model.Application{}
	result.ID = uint(appID)

	model.DB.Model(&model.Application{}).Preload("Users").First(&result)

	renderx.JSON(w, http.StatusOK, result)
}
