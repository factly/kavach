package policy

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/application"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

//details - get policy for an application using application_id
// @Summary get policy for an application using application_id
// @Description get policy for an application using application_id
// @Tags OrganisationPolicy
// @ID list-application-policy
// @Produce json
// @Param X-User header string true "User ID"
// @Param application_id path string true "Organisation ID"
// @Param OrganisationRoleBody body model.Policy true "Policy"
// @Success 200 {object} model.ApplicationRole
// @Router /organisations/{organisation_id}/applications/{application_id}/policy [get]
func list(w http.ResponseWriter, r *http.Request) {
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

	// check if the user is part of application or not
	flag := application.CheckAuthorisation(uint(appID), uint(userID))
	if !flag {
		loggerx.Error(errors.New("user is not part of application"))
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// ----------------listing organisation policies by ID from the kavachDB-------------
	policies := make([]model.ApplicationPolicy, 0)
	err = model.DB.Model(&model.ApplicationPolicy{}).Where(&model.ApplicationPolicy{
		ApplicationID: uint(appID),
	}).Preload("Application").Preload("Roles").Find(&policies).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// sending the JSON response
	renderx.JSON(w, http.StatusOK, policies)
}
