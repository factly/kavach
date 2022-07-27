package roles

import (
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
	"github.com/go-chi/chi"
)

//delete - Delete role for an space using space_id
// @Summary Delete role for an space using space_id
// @Description Delete role for an space using space_id
// @Tags SpaceRoles
// @ID delete-space-role
// @Produce  json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param application_id path string true "Application ID"
// @Param SpaceRoleBody body model.SpaceRole true "Space role Body"
// @Success 200 {object} model.SpaceRole
// @Router /organisations/{organisation_id}/application/{application_id}/spaces/{space_id}/roles [delete]
func delete(w http.ResponseWriter, r *http.Request) {
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

	// Get application id from path
	applicationID := chi.URLParam(r, "application_id")
	appID, err := strconv.Atoi(applicationID)
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

	// getting the space role name using roleID
	roleMap := make(map[string]interface{})
	err = model.DB.Model(&model.SpaceRole{}).Where(&model.SpaceRole{
		Base: model.Base{
			ID: uint(roleIDInt),
		},
	},
	).Pluck("name", &roleMap).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	// ----------- Delete roles from the keto server and kavach-database------------
	//binding organisation role
	spaceRole := model.SpaceRole{}
	spaceRole.ID = uint(roleIDInt)

	// delete the role from space
	err = tx.Delete(spaceRole).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// delete the role from keto server
	ketoRoleID := "roles:org:" + fmt.Sprint(orgID) + ":app:" + fmt.Sprint(appID) + ":space:" + fmt.Sprint(spaceID) + ":" + roleMap["name"].(string)
	err = keto.DeleteRole("/engines/acp/ory/regex/roles", ketoRoleID)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Commit() // commiting the transation
	// Send JSON response
	renderx.JSON(w, http.StatusOK, nil)
}
