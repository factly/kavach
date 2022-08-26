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

//create - Create policy for an organisation using organisation_id
// @Summary Create policy for an organisation using organisation_id
// @Description Create policy for an organisation using organisation_id
// @Tags OrganisationPolicy
// @ID create-organisation-policy
// @Produce json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Success 200 {object} nil
// @Router /organisations/{organisation_id}/policy [post]
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

	// ------------- Creating Organisation Policy in the Database -----------
	// binding policyReq to the model.OrganisationPolicy datamodel
	var policy model.OrganisationPolicy
	policy.CreatedByID = uint(userID)
	policy.Slug = reqBody.Slug
	policy.Name = reqBody.Name
	policy.Description = reqBody.Description
	policy.OrganisationID = uint(orgID)
	policy.Permissions = reqBody.Permissions
	roles := make([]model.OrganisationRole, 0)
	for _, each := range reqBody.Roles {
		roles = append(roles, model.OrganisationRole{Base: model.Base{ID: each}})
	}

	policy.Roles = roles
	// inserting the organisation policy on the kavachDB
	tx := model.DB.Begin()
	err = tx.Model(&model.OrganisationPolicy{}).Create(&policy).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	var permissions []permission
	err = json.Unmarshal(reqBody.Permissions.RawMessage, &permissions)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}
	// ----------- Creating relation ruple for policies on the keto server ---------------
	for _, role := range reqBody.Roles {
		roleName, err := util.GetOrganisationRoleByID(role)
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InvalidID()))
			return
		}

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
						Object:    fmt.Sprintf("roles:org:%d", orgID),
						Relation:  *roleName,
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
