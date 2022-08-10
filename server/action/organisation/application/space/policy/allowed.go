package policy

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util"
	"github.com/factly/kavach-server/util/user"
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

	// Get organisation id from path
	organisationID := chi.URLParam(r, "organisation_id")
	orgID, err := strconv.Atoi(organisationID)
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

	// VERIFY WHETHER THE USER IS PART OF space OR NOT
	objectID := fmt.Sprintf("org:%d:app:%d:space:%d", orgID, applicationID, spaceID)
	isAuthorised, err := user.IsUserAuthorised(
		namespace,
		objectID,
		fmt.Sprintf("%d", userID),
	)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	if !isAuthorised {
		loggerx.Error(errors.New("user is not part of the space"))
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
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
	// if the subject_type is id then it uses CheckKetoRelationTupleWithSubjectID function to validate the action
	isAllowed, err := user.IsActionValid(namespace, fmt.Sprintf("resource:org:%d:app:%d:space:%d:%s", orgID, applicationID, spaceID,reqBody.Resource), reqBody.Subject, reqBody.Action, reqBody.SubjectType, fmt.Sprintf("roles:org:%d:app:%d:space:%d", orgID, applicationID, spaceID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	responseBody := map[string]interface{}{
		"allowed": isAllowed,
	}

	//render JSON
	renderx.JSON(w, http.StatusOK, responseBody)
}
