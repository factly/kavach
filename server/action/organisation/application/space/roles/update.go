package roles

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util"
	"github.com/factly/kavach-server/util/space"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
)

//create - Update role for an space using space_id
// @Summary Update role for an space using space_id
// @Description Update role for an space using space_id
// @Tags SpaceRoles
// @ID update-space-role
// @Produce  json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param application_id path string true "Application ID"
// @Param OrganisationRoleBody body model.OrganisationRole true "Organisation role Body"
// @Success 200 {object} model.SpaceRole
// @Router /organisations/{organisation_id}/applications/{application_id}/spaces/{space_id}/roles/{role_id} [put]
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

	// Get space id from path
	sID := chi.URLParam(r, "space_id")
	spaceID, err := strconv.Atoi(sID)
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

	// check whether user is owner or not
	err = util.CheckOwner(uint(userID), uint(orgID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// check whether user is part of space or not
	tx := model.DB.Begin()
	flag := space.CheckAuthorisation(uint(spaceID), uint(userID))
	if !flag {
		tx.Rollback()
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// Bind space role
	spaceRole := &model.SpaceRole{}
	if err := json.NewDecoder(r.Body).Decode(&spaceRole); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	// Validate application role
	validationError := validationx.Check(spaceRole)
	if validationError != nil {
		errorx.Render(w, validationError)
		return
	}

	var count int64
	err = model.DB.Model(&model.SpaceRole{}).Not("id = ?", roleID).Where(&model.SpaceRole{
		SpaceID: uint(spaceID),
		Slug:    spaceRole.Slug,
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
		"name":        spaceRole.Name,
		"slug":        spaceRole.Slug,
		"description": spaceRole.Description,
	}

	//update the application role
	err = model.DB.Model(&model.SpaceRole{}).Where("space_id = ? AND id = ?", spaceID, roleIDInt).Updates(updateMap).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusOK, spaceRole)
}
