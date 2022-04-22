package roles

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util"
	"github.com/factly/kavach-server/util/keto"
	"github.com/factly/kavach-server/util/space"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
)

//create - Create role for an space using space_id
// @Summary Create role for an space using space_id
// @Description Create role for an space using space_id
// @Tags SpaceRoles
// @ID create-space-role
// @Produce  json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param application_id path string true "Application ID"
// @Param space_id path string true "Space ID"
// @Param SpaceRoleBody body model.SpaceRole true "Organisation role Body"
// @Success 200 {object} model.SpaceRole
// @Router /organisations/{organisation_id}/application/{application_id}/space/{space_id}/roles [post]
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

	// Get Application ID from the path
	appID := chi.URLParam(r, "application_id")
	applicationID, err := strconv.Atoi(appID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// Get Space ID from the path
	sID := chi.URLParam(r, "space_id")
	spaceID, err := strconv.Atoi(sID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
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

	// validating slug
	var count int64
	err = model.DB.Model(&model.SpaceRole{}).Find(model.SpaceRole{
		Slug: spaceRole.Slug,
	}).Count(&count).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	if count > 0 {
		loggerx.Error(errors.New("space role slug already exists"))
		errorx.Render(w, errorx.Parser(errorx.SameNameExist()))
		return
	}

	// Check if user is owner of organisation
	if err := util.CheckOwner(uint(userID), uint(orgID)); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// check if the user if part of space or not
	tx := model.DB.Begin()
	flag := space.CheckAuthorisation(uint(spaceID), uint(userID))
	if !flag {
		tx.Rollback()
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// Create space role
	spaceRole.SpaceID = uint(spaceID)
	spaceRole.CreatedByID = uint(userID)
	spaceRole.Users = append(spaceRole.Users, model.User{
		Base: model.Base{
			ID: uint(userID),
		},
	})

	err = model.DB.Model(&model.SpaceRole{}).Create(spaceRole).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	tx.Commit()

	// Creaing space role on keto server
	reqRole := &model.Role{}
	reqRole.ID = "roles:org:" + fmt.Sprint(orgID) + ":app:" + fmt.Sprint(applicationID) + ":space:" + fmt.Sprint(spaceID) + ":" + spaceRole.Name
	reqRole.Description = spaceRole.Description
	reqRole.Members = []string{fmt.Sprint(userID)}

	err = keto.UpdateRole("/engines/acp/ory/regex/roles", reqRole)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.NetworkError()))
		return
	}
	// sending the JSON response
	renderx.JSON(w, http.StatusOK, spaceRole)
}
