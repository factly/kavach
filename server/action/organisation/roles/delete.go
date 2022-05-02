package roles

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util"
	"github.com/factly/kavach-server/util/keto"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

//create - Delete role for an organisation using organisation_id
// @Summary Delete role for an organisation using organisation_id
// @Description Delete role for an organisation using organisation_id
// @Tags Organisationroles
// @ID delete-organisation-role
// @Produce  json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param OrganisationRoleBody body model.OrganisationRole true "Organisation role Body"
// @Success 200 {object} model.OrganisationRole
// @Router /organisations/{organisation_id}/roles/{role_id} [delete]
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

	//binding organisation role
	orgRole := new(model.OrganisationRole)
	orgRole.ID = uint(roleIDInt)

	//initiating a transaction
	tx := model.DB.Begin()
	// getting the organisation role name using orgId
	roleMap := make(map[string]interface{})
	err = tx.Model(&model.OrganisationRole{}).Where(&model.Space{
		Base: model.Base{
			ID: uint(roleIDInt),
		},
	},
	).Pluck("name", &roleMap).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	// delete the role from organisation
	err = model.DB.Delete(orgRole).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// delete the role from keto server
	ketoRoleID := "roles:org:" + fmt.Sprint(orgID) + ":" + roleMap["name"].(string)
	err = keto.DeleteRole("/engines/acp/ory/regex/roles", ketoRoleID)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// Send JSON response
	tx.Commit()
	renderx.JSON(w, http.StatusOK, nil)
}
