package policy

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/user"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

//allowed - check if a user has permission to perform an action on a resource
// @Summary check if a user has permission to perform an action on a resource
// @Description check if a user has permission to perform an action on a resource
// @Tags OrganisationPolicy
// @ID check-organisation-policy
// @Produce json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Success 200 {object} nil
// @Router /organisations/{organisation_id}/policy/allowed [post]
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

	// VERIFY WHETHER THE USER IS PART OF ORGANISATION OR NOT
	isAuthorised, err := user.IsUserAuthorised(
		"organisations",
		fmt.Sprintf("org:%d", orgID),
		fmt.Sprintf("%d", userID),
	)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}
	if !isAuthorised {
		loggerx.Error(errors.New("user is not part of the organisation"))
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

	// if the subject_type is id then it uses CheckKetoRelationTupleWithSubjectID function to validate the action
	isAllowed, err := user.IsActionValid(namespace, fmt.Sprintf("resource:org:%d:%s", orgID, reqBody.Resource), reqBody.Subject, reqBody.Action, reqBody.SubjectType, fmt.Sprintf("roles:org:%d", orgID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	responseBody := map[string]interface{}{
		"allowed": isAllowed,
	}
	if !isAllowed {
		renderx.JSON(w, http.StatusForbidden, responseBody)
		return
	}
	//render JSON
	renderx.JSON(w, http.StatusOK, responseBody)
}
