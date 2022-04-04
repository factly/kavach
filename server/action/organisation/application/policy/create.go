package policy

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util"
	"github.com/factly/kavach-server/util/application"
	"github.com/factly/kavach-server/util/keto"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

//create - Create policy for an organisation using organisation_id
// @Summary Create policy for an organisation using organisation_id
// @Description Create policy for an organisation using organisation_id
// @Tags OrganisationPolicy
// @ID create-organisation-policy
// @Produce json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param OrganisationRoleBody body model.Policy true "Policy"
// @Success 200 {object} model.Organisationrole
// @Router /organisations/{organisation_id}/roles [post]
func create(w http.ResponseWriter, r *http.Request) {
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

	// Check if user is owner of organisation
	if err := util.CheckOwner(uint(userID), uint(orgID)); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// check if user is part of application or not
	flag := application.CheckAuthorisation(uint(appID), uint(userID))
	if !flag {
		loggerx.Error(errors.New("user is not part of application"))
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

	// ----------- Creating policy on the keto server ---------------
	result := model.Policy{}
	commonPolicyString := fmt.Sprint(":org:", orgID, ":app:", appID, ":")
	result.ID = "id" + commonPolicyString + reqBody.Name
	result.Description = reqBody.Description

	for _, value := range reqBody.Users {
		result.Subjects = append(result.Subjects, "roles:org:"+fmt.Sprint(orgID)+":app:"+fmt.Sprint(appID)+":"+value)
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

	renderx.JSON(w, http.StatusOK, nil)
}
