package policy

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/keto"
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

	// Check if user is part of organisation
	permission := &model.OrganisationUser{}
	err = model.DB.Model(&model.OrganisationUser{}).Where(&model.OrganisationUser{
		OrganisationID: uint(orgID),
		UserID:         uint(userID),
	}).First(permission).Error
	if err != nil {
		loggerx.Error(err)
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
	policyObj := new(model.CheckKeto)
	policyObj.Subject = fmt.Sprintf("roles:org:%d:%s", orgID, reqBody.Subject)
	policyObj.Action = fmt.Sprintf("actions:org:%d:%s", orgID, reqBody.Action)
	policyObj.Resource = fmt.Sprintf("resources:org:%d:%s", orgID, reqBody.Resource)
	responseBody, err := keto.CheckKetoPermission(*policyObj)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	//render JSON
	renderx.JSON(w, http.StatusOK, responseBody)
}
