package organisation

import (
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
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

	userID, _ := strconv.Atoi(r.Header.Get("X-User"))

	model.DB.Model(&model.OrganisationUser{}).Where(&model.OrganisationUser{
		UserID:         uint(userID),
		OrganisationID: uint(id),
	}).First(&permission)

	organisation := &model.Organisation{}
	organisation.ID = uint(id)

	err = model.DB.Model(&model.Organisation{}).Preload("Medium").Preload("Applications").Preload("OrganisationUsers").Preload("OrganisationUsers.User").Preload("Roles").First(&organisation).Error

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
	result.Applications = applications

	renderx.JSON(w, http.StatusOK, result)
}
