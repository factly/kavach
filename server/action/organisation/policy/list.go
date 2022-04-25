package policy

import (
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

//details - get policy for an organisation using organisation_id
// @Summary get policy for an organisation using organisation_id
// @Description get policy for an organisation using organisation_id
// @Tags OrganisationPolicy
// @ID list-organisation-policy
// @Produce json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param OrganisationRoleBody body model.Policy true "Policy"
// @Success 200 {object} nil
// @Router /organisations/{organisation_id}/policy [get]
func list(w http.ResponseWriter, r *http.Request) {
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

	// ----------------listing organisation policies by ID from the kavachDB-------------
	policies := make([]model.OrganisationPolicy, 0)
	err = model.DB.Model(&model.OrganisationPolicy{}).Where(&model.OrganisationPolicy{
		OrganisationID: uint(orgID),
	}).Preload("Organisation").Preload("Roles").Find(&policies).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// sending the JSON response
	renderx.JSON(w, http.StatusOK, policies)
}
