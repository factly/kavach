package policy

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util"
	keto "github.com/factly/kavach-server/util/keto/relationTuple"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
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
// @Router /organisations/{organisation_id}/policy/{policy_id} [put]
func update(w http.ResponseWriter, r *http.Request) {
	// Get organisation ID path parameter
	organisationID := chi.URLParam(r, "organisation_id")
	orgID, err := strconv.Atoi(organisationID)
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

	// Get user id from request header
	userID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// Check if user is owner of organisation
	if err := util.CheckOwner(uint(userID), uint(orgID)); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// decoding request body to policyReq struct
	var reqBody policyReq
	err = json.NewDecoder(r.Body).Decode(&reqBody)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	// Binding reqBody to the OrganisationPolicy model
	policy := new(model.OrganisationPolicy)
	policy.ID = uint(policyID)
	policy.Name = reqBody.Name
	policy.Slug = reqBody.Slug
	policy.Description = reqBody.Description
	policy.OrganisationID = uint(orgID)
	policy.Permissions = reqBody.Permissions
	roles := make([]model.OrganisationRole, 0)
	for _, each := range reqBody.Roles {
		organisationRole := model.OrganisationRole{}
		err = model.DB.Model(&model.OrganisationRole{}).Where(&model.OrganisationRole{
			Base: model.Base{
				ID: each,
			},
		}).Find(&organisationRole).Error
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DecodeError()))
			return
		}
		roles = append(roles, organisationRole)
	}

	policy.Roles = roles
	tx := model.DB.Begin()
	err = model.DB.Model(&model.OrganisationPolicy{}).Where("id = ?", policyID).Updates(policy).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	err = tx.Model(&policy).Association("Roles").Replace(&roles)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	var permissions []permission
	err = json.Unmarshal(reqBody.Permissions.RawMessage, &permissions)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// ----------- Creating policy on the keto server ---------------
	for _, role := range policy.Roles {

		for _, permission := range permissions {
			for _, action := range permission.Actions {
				tuple := &model.KetoRelationTupleWithSubjectSet{
					KetoSubjectSet: model.KetoSubjectSet{
						Namespace: namespace,
						Object:    fmt.Sprintf("resource:org:%d:%s", orgID, permission.Resource),
						Relation:  action,
					},
					SubjectSet: model.KetoSubjectSet{
						Namespace: namespace,
						Object:    fmt.Sprintf("roles:org%d", orgID),
						Relation:  role.Name,
					},
				}

				err = keto.CreateRelationTupleWithSubjectSet(tuple)
				if err != nil {
					tx.Rollback()
					loggerx.Error(err)
					errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
					return
				}
			}
		}
	}

	tx.Commit()
	renderx.JSON(w, http.StatusOK, policy)
}
