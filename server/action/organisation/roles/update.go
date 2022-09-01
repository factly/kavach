package roles

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

//update - Update role for an organisation using organisation_id
// @Summary Update role for an organisation using organisation_id
// @Description Update role for an organisation using organisation_id
// @Tags Organisationroles
// @ID update-organisation-role
// @Produce  json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param OrganisationRoleBody body model.OrganisationRole true "Organisation role Body"
// @Success 200 {object} model.OrganisationRole
// @Router /organisations/{organisation_id}/roles/{role_id} [put]
func update(w http.ResponseWriter, r *http.Request) {
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

	// Get role id from path
	roleID := chi.URLParam(r, "role_id")
	roleIDInt, err := strconv.Atoi(roleID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
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
	// check whether user is owner or not
	err = util.CheckOwner(uint(userID), uint(orgID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	var count int64
	err = model.DB.Model(&model.OrganisationRole{}).Not("id = ?", roleIDInt).Where(&model.OrganisationRole{
		OrganisationID: uint(orgID),
		Slug:           organisationRole.Slug,
	}).Count(&count).Error
	if err != nil || count > 0 {
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
		} else {
			loggerx.Error(errors.New("slug already exists"))
			errorx.Render(w, errorx.Parser(errorx.SameNameExist()))
		}
		return
	}

	updateMap := map[string]interface{}{
		"name":        organisationRole.Name,
		"slug":        organisationRole.Slug,
		"description": organisationRole.Description,
	}
	//update the organisation role
	err = model.DB.Model(&model.OrganisationRole{}).Where("organisation_id = ? AND id = ?", orgID, roleIDInt).Updates(updateMap).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusOK, organisationRole)
}
