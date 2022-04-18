package policy

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/application"
	"github.com/factly/kavach-server/util/keto"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

//allowed - check if a user has permission to perform an action on a resource
// @Summary check if a user has permission to perform an action on a resource
// @Description check if a user has permission to perform an action on a resource
// @Tags SpacePolicy
// @ID check-space-policy
// @Produce json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param organisation_id path string true "Application ID"
// @Param organisation_id path string true "Space ID"
// @Success 200 {object} nil
// @Router /organisations/{organisation_id}/applications/{application_id}/spaces/{space_id}/policy/allowed [post]
func allowed(w http.ResponseWriter, r *http.Request) {
	// Get user id from request header
	userID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// Get organisation ID path parameter
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

	// Check if user is part of application or not
	flag := application.CheckAuthorisation(uint(appID), uint(userID))
	if !flag {
		loggerx.Error(errors.New("user is not part of application"))
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// decoding reqBody into CheckKeto model
	reqBody := new(model.CheckKeto)
	err = json.NewDecoder(r.Body).Decode(reqBody)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}
	// -------------verifying whether a particular action is allowed on a resource or not ------------
	policyObj := new(model.CheckKeto)
	policyObj.Subject = fmt.Sprintf("roles:org:%d:app:%d:space:%d:%s", orgID, appID, spaceID, reqBody.Subject)
	policyObj.Action = fmt.Sprintf("actions:org:%d:app:%d:space:%d:%s", orgID, appID, spaceID, reqBody.Action)
	policyObj.Resource = fmt.Sprintf("resources:org:%d:app:%d:space:%d:%s", orgID, appID, spaceID, reqBody.Resource)

	responseBody, err := keto.CheckKetoPermission(*policyObj)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	//render JSON
	renderx.JSON(w, http.StatusOK, responseBody)
}
