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
	"github.com/factly/kavach-server/util/user"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

//create - Create policy for an organisation using organisation_id
// @Summary Create policy for an organisation using organisation_id
// @Description Create policy for an organisation using organisation_id
// @Tags OrganisationPolicy
// @ID create-space-policy
// @Produce json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param OrganisationRoleBody body model.Policy true "Policy"
// @Success 200 {object} nil
// @Router /organisations/{organisation_id}/applications/{application_id}/spaces/{space_id}/policy [post]
func create(w http.ResponseWriter, r *http.Request) {
	// Get organisation ID path parameter
	organisationID := chi.URLParam(r, "organisation_id")
	orgID, err := strconv.Atoi(organisationID)
	if err != nil {
		loggerx.Error(err)
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

	// Get user id from request header
	userID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
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

	// Check if user is owner of organisation
	if err := util.CheckOwner(uint(userID), uint(orgID)); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// VERIFY WHETHER THE USER IS PART OF space OR NOT
	objectID := fmt.Sprintf("org:%d:app:%d:space:%d", orgID, appID, spaceID)
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

	// decoding request body to policyReq struct
	var reqBody policyReq
	err = json.NewDecoder(r.Body).Decode(&reqBody)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
	}

	// -------------------- Adding the space policy to the kavach DB --------------------------
	// binding the policyReq to SpacePolicy model
	var policy model.SpacePolicy
	policy.CreatedByID = uint(userID)
	policy.Slug = reqBody.Slug
	policy.Name = reqBody.Name
	policy.Description = reqBody.Description
	policy.SpaceID = uint(spaceID)
	policy.Permissions = reqBody.Permissions
	roles := make([]model.SpaceRole, 0)
	for _, each := range reqBody.Roles {
		roles = append(roles, model.SpaceRole{Base: model.Base{ID: each}})
	}

	policy.Roles = roles
	// inserting space role to the kavachDB
	tx := model.DB.Begin()
	err = tx.Model(&model.SpacePolicy{}).Create(&policy).Error
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

	// ----------- Creating policy on the keto server ---------------
	for _, role := range reqBody.Roles {
		roleName, err := util.GetSpaceRoleByID(role)
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
						Object:    fmt.Sprintf("resource:org:%d:app:%d:space:%d:%s", orgID, appID, spaceID, permission.Resource),
						Relation:  action,
					},
					SubjectSet: model.KetoSubjectSet{
						Namespace: namespace,
						Object:    fmt.Sprintf("roles:org:%d:app:%d:space:%d", orgID, appID, spaceID),
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
