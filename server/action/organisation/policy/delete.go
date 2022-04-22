package policy

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

//delete - Delete policy for an organisation using organisation_id
// @Summary Delete policy for an organisation using organisation_id
// @Description Delete policy for an organisation using organisation_id
// @Tags OrganisationPolicy
// @ID delete-organisation-policy
// @Produce json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param OrganisationRoleBody body model.Policy true "Policy"
// @Success 200 {object} model.Organisationrole
// @Router /organisations/{organisation_id}/roles [delete]
func delete(w http.ResponseWriter, r *http.Request) {
	// Get organisation ID path parameter
	organisationID := chi.URLParam(r, "organisation_id")
	orgID, err := strconv.Atoi(organisationID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// Get user id from request header
	userID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// Get policy id path parameter
	pID := chi.URLParam(r, "policy_id")
	policyID, err := strconv.Atoi(pID)
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

	// getting policy name from policyID
	policyName, err := util.GetOrganisationPolicyByID(uint(policyID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}
	// ---------------- Delete policy from the keto server -----------------
	id := "id" + fmt.Sprint(":org:", orgID, ":") + *policyName
	err = keto.DeletePolicy("/engines/acp/ory/regex/policies/" + id)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	//------------- deleting from the kavachDB -------------
	err = model.DB.Delete(&model.OrganisationPolicy{}, policyID).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	
	// send JSON response
	renderx.JSON(w, http.StatusOK, nil)

}
