package policy

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util"
	keto "github.com/factly/kavach-server/util/keto/relationTuple"
	"github.com/factly/kavach-server/util/space"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/slugx"
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
// @Router /organisations/{organisation_id}/applications/{application_id}/spaces/{space_id}/policy/{policy_id} [post]
func update(w http.ResponseWriter, r *http.Request) {
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

	// Get space ID path parameter
	sID := chi.URLParam(r, "space_id")
	spaceID, err := strconv.Atoi(sID)
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

	// Check if user is owner of organisation
	if err := util.CheckOwner(uint(userID), uint(orgID)); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// check if user is part of space or not
	flag := space.CheckAuthorisation(uint(spaceID), uint(userID))
	if !flag {
		loggerx.Error(errors.New("user is not part of space"))
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

	// binding the policyReq to SpacePolicy model
	var policy model.SpacePolicy
	policy.ID = uint(policyID)
	policy.Name = reqBody.Name
	policy.Description = reqBody.Description
	policy.Slug = slugx.Make(reqBody.Name)
	policy.SpaceID = uint(spaceID)
	policy.Permissions = reqBody.Permissions
	tx := model.DB.Begin()
	var count int64
	err = tx.Model(&model.SpacePolicy{}).Where(&model.SpacePolicy{
		SpaceID: uint(spaceID),
		Slug:    policy.Slug,
	}).Count(&count).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	if count >= 1 {
		tx.Rollback()
		loggerx.Error(errors.New("slug already exists"))
		errorx.Render(w, errorx.Parser(errorx.SameNameExist()))
		return
	}
	roles := make([]model.SpaceRole, 0)
	for _, each := range reqBody.Roles {
		spaceRole := model.SpaceRole{}
		err = model.DB.Model(&model.SpaceRole{}).Where(&model.SpaceRole{
			Base: model.Base{
				ID: each,
			},
		}).Find(&spaceRole).Error
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DecodeError()))
			return
		}
		roles = append(roles, spaceRole)
	}

	policy.Roles = roles

	// updating the policy in the kavachDB
	err = tx.Model(&model.SpacePolicy{}).Where("id = ?", policyID).Updates(&policy).Error
	if err != nil {
		tx.Rollback()
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
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// ----------- updating the policy on the keto server ---------------
	for _, role := range policy.Roles {
		for _, permission := range permissions {
			for _, action := range permission.Actions {
				tuple := &model.KetoRelationTupleWithSubjectSet{
					KetoSubjectSet: model.KetoSubjectSet{
						Namespace: namespace,
						Object:    fmt.Sprintf("resource:org:%d:app:%d:space:%d:%s", orgID, appID, spaceID, permission.Resource),
						Relation:  action,
					},
					SubjectSet: model.KetoSubjectSet{
						Namespace: namespace,
						Object:    fmt.Sprintf("roles:org:%d:app:%d:space:%d", orgID, appID, spaceID),
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
