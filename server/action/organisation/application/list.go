package application

import (
	"net/http"
	"strconv"
	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// list - Get all organisations applications
// @Summary Show all organisations applications
// @Description Get all organisations applications
// @Tags OrganisationApplications
// @ID get-all-organisations-applications
// @Produce  json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Success 200 {array} []model.Application
// @Router /organisations/{organisation_id}/applications [get]
func list(w http.ResponseWriter, r *http.Request) {
	organisationID := chi.URLParam(r, "organisation_id")
	oID, err := strconv.Atoi(organisationID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	uID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// Check if user is part of organisation
	permission := &model.OrganisationUser{}
	err = model.DB.Model(&model.OrganisationUser{}).Where(&model.OrganisationUser{
		OrganisationID: uint(oID),
		UserID:         uint(uID),
	}).First(permission).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}
	result := make([]model.Application, 0)
	model.DB.Model(&model.Application{}).Where(&model.Application{
		OrganisationID: uint(oID),
	}).Preload("Users").Preload("Users.Medium").Preload("Medium").Preload("Tokens").Preload("Spaces").Find(&result)

	filteredApps := make([]model.Application, 0)
	for _, app := range result {	
		for _, user := range app.Users{
			if user.ID == uint(uID) {
				filteredApps = append(filteredApps, app)
				break
			}
		}
	}

	if err!=nil{
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	renderx.JSON(w, http.StatusOK, filteredApps)
}
