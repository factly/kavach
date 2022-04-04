package roles

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/space"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// details - Get SpaceRole by id
// @Summary Show a SpaceRole by id
// @Description Get SpaceRole by ID
// @Tags Spaces
// @ID get-space-role-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param application_id path string true "Application ID"
// @Param space_id path string true "Space ID"
// @Success 200 {object} model.SpaceRole
// @Router /organisations/{organisation_id}/applications/{application_id}/spaces/{space_id}/role/{role_id} [get]
func details(w http.ResponseWriter, r *http.Request) {
	// Get user id from request header
	userID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
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

	// check whether user is part of space or not 
	flag := space.CheckAuthorisation(uint(spaceID), uint(userID))
	if !flag {
		loggerx.Error(errors.New("user is not part of space"))
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// Get space role
	role := &model.SpaceRole{}
	err = model.DB.Model(&model.SpaceRole{}).Where(&model.ApplicationRole{
		ApplicationID: uint(spaceID),
		Base: model.Base{
			ID: uint(roleIDInt),
		},
	}).First(role).Preload("Space").Preload("Users").Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	renderx.JSON(w, http.StatusOK, role)
}
