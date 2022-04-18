package policy

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
	"github.com/go-chi/chi"
	"github.com/lib/pq"
)

//update - Update policy for an organisation using organisation_id
// @Summary Update policy for an organisation using organisation_id
// @Description Update policy for an organisation using organisation_id
// @Tags OrganisationPolicy
// @ID update-organisation-policy
// @Produce json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param OrganisationRoleBody body model.Policy true "Policy"
// @Success 200 {object} nil
// @Router /organisations/{organisation_id}/applications/{application_id}/spaces/{space_id}/policy/{policy_id} [post]
func update(w http.ResponseWriter, r *http.Request) {
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
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// Get application ID path parameter
	applicationID := chi.URLParam(r, "application_id")
	appID, err := strconv.Atoi(applicationID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// Get space ID path parameter
	sID := chi.URLParam(r, "space_id")
	spaceID, err := strconv.Atoi(sID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// Get policy ID path parameter
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

	// check if user is part of space or not
	flag := space.CheckAuthorisation(uint(spaceID), uint(userID))
	if !flag {
		loggerx.Error(errors.New("user is not part of space"))
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}
	// decoding request body to policyReq struct
	var reqBody policyReq
	err = json.NewDecoder(r.Body).Decode(&reqBody)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
	}

	// binding the policyReq to SpacePolicy model
	var policy model.SpacePolicy
	policy.Name = reqBody.Name
	policy.Description = reqBody.Description
	policy.SpaceID = uint(spaceID)
	for _, value := range reqBody.Permissions {
		var permission model.Permission
		permission.Resource = value.Resource
		permission.Actions = pq.StringArray(value.Actions)
		policy.Permissions = append(policy.Permissions, permission)
	}

	roles := make([]model.SpaceRole, 0)
	for _, each := range reqBody.Roles {
		roles = append(roles, model.SpaceRole{Base: model.Base{ID: each}})
	}

	policy.Roles = roles

	// updating the policy in the kavachDB
	tx := model.DB.Begin()
	err = tx.Model(&model.SpacePolicy{}).Where("id = ?", policyID).Updates(&policy).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	
	// ----------- updating the policy on the keto server ---------------
	result := model.Policy{}
	commonPolicyString := fmt.Sprint(":org:", orgID, ":app:", appID, ":space:", spaceID, ":")
	result.ID = "id" + commonPolicyString + reqBody.Name
	result.Description = reqBody.Description

	for _, value := range reqBody.Roles {
		roleName, err := util.GetSpaceRoleByID(value)
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
		result.Subjects = append(result.Subjects, "roles:org:"+fmt.Sprint(orgID)+":app:"+fmt.Sprint(appID)+":space:"+fmt.Sprint(spaceID)+":"+*roleName)
	}

	for _, permission := range reqBody.Permissions {
		result.Resources = append(result.Resources, "resources"+commonPolicyString+permission.Resource)
		for _, action := range permission.Actions {
			result.Actions = append(result.Actions, "actions"+commonPolicyString+action)
		}
	}

	result.Effect = "allow"
	err = keto.UpdatePolicy("/engines/acp/ory/regex/policies", &result)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.NetworkError()))
		return
	}

	renderx.JSON(w, http.StatusOK, policy)
}
