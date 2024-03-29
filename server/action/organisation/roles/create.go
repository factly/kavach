package roles

import (
	"encoding/json"
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

//create - Create role for an organisation using organisation_id
// @Summary Create role for an organisation using organisation_id
// @Description Create role for an o	rganisation using organisation_id
// @Tags Organisationroles
// @ID create-organisation-role
// @Produce  json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param OrganisationRoleBody body model.OrganisationRole true "Organisation role Body"
// @Success 200 {object} model.OrganisationRole
// @Router /organisations/{organisation_id}/roles [post]
func create(w http.ResponseWriter, r *http.Request) {
	// Get user id from request header
	userID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// Get organisation id from path
	organisationID := chi.URLParam(r, "organisation_id")
	orgID, err := strconv.Atoi(organisationID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// Check if user is owner of organisation
	if err := util.CheckOwner(uint(userID), uint(orgID)); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// Bind organisation role
	organisationRole := &model.OrganisationRole{}
	if err := json.NewDecoder(r.Body).Decode(&organisationRole); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	// Validate organisation role
	validationError := validationx.Check(organisationRole)
	if validationError != nil {
		errorx.Render(w, validationError)
		return
	}

	// Create organisation role
	organisationRole.OrganisationID = uint(orgID)
	organisationRole.CreatedByID = uint(userID)

	err = model.DB.Model(&model.OrganisationRole{}).Create(organisationRole).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusOK, organisationRole)
}
