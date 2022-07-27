package policy

import (
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

//details - get policy for an organisation using organisation_id
// @Summary get policy for an organisation using organisation_id
// @Description get policy for an organisation using organisation_id
// @Tags OrganisationPolicy
// @ID get-organisation-policy
// @Produce json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param OrganisationRoleBody body model.Policy true "Policy"
// @Success 200 {object} nil
// @Router /organisations/{organisation_id}/policy/{policy_id} [get]
func details(w http.ResponseWriter, r *http.Request) {
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

	// Get policy id from path
	pID := chi.URLParam(r, "policy_id")
	policyID, err := strconv.Atoi(pID)
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

	// ---------------- get details of the organisation policy from the database ---------------------
	policy := new(model.OrganisationPolicy)
	err = model.DB.Where(&model.OrganisationPolicy{
		Base: model.Base{
			ID: uint(policyID),
		},
	}).Preload("Organisation").Preload("Roles").First(policy).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	// sending JSON response
	renderx.JSON(w, http.StatusOK, policy)
}
