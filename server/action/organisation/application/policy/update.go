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
	"github.com/factly/x/slugx"
	"github.com/go-chi/chi"
)

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

	// VERIFY WHETHER THE USER IS PART OF APPLICATION OR NOT
	isAuthorised, err := user.IsUserAuthorised(
		namespace,
		fmt.Sprintf("org:%d:app:%d", orgID, appID),
		fmt.Sprintf("%d", userID),
	)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}
	if !isAuthorised {
		loggerx.Error(errors.New("user is not part of the application"))
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

	// binding the policyReq to ApplicationPolicy model
	policy := new(model.ApplicationPolicy)
	policy.ID = uint(policyID)
	policy.Name = reqBody.Name
	policy.Description = reqBody.Description
	policy.ApplicationID = uint(appID)
	policy.Permissions = reqBody.Permissions
	policy.Slug = slugx.Make(reqBody.Name)
	policy.OrganisationID = uint(orgID)
	tx := model.DB.Begin()
	var count int64
	err = tx.Model(&model.ApplicationPolicy{}).Not("id = ?", policyID).Where(&model.ApplicationPolicy{
		ApplicationID: uint(appID),
		Slug:          policy.Slug,
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
	roles := make([]model.ApplicationRole, 0)
	for _, each := range reqBody.Roles {
		appRole := model.ApplicationRole{}
		err = model.DB.Model(&model.ApplicationRole{}).Where(&model.ApplicationRole{
			Base: model.Base{
				ID: each,
			},
		}).Find(&appRole).Error
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DecodeError()))
			return
		}
		roles = append(roles, appRole)
	}

	policy.Roles = roles

	// policyBeforeUpdate : it is used to store a policy object which helps in deleting the relation tuples which are not needed after updating policy
	policyBeforeUpdate := model.OrganisationPolicy{}
	err = tx.Model(&model.ApplicationPolicy{}).Where(&model.ApplicationPolicy{
		Base: model.Base{
			ID: uint(policyID),
		},
	}).Preload("Roles").Find(&policyBeforeUpdate).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	var oldPermissions []permission
	err = json.Unmarshal(policyBeforeUpdate.Permissions.RawMessage, &oldPermissions)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	for _, role := range policyBeforeUpdate.Roles {
		for _, eachPermission := range oldPermissions {
			for _, action := range eachPermission.Actions {
				tuple := &model.KetoRelationTupleWithSubjectSet{
					KetoSubjectSet: model.KetoSubjectSet{
						Namespace: namespace,
						Object:    fmt.Sprintf("resource:org:%d:app:%d:%s", orgID, appID, eachPermission.Resource),
						Relation:  action,
					},
					SubjectSet: model.KetoSubjectSet{
						Namespace: namespace,
						Object:    fmt.Sprintf("roles:org%d:app:%d", orgID, appID),
						Relation:  role.Name,
					},
				}

				err = keto.DeleteRelationTupleWithSubjectSet(tuple)
				if err != nil {
					tx.Rollback()
					loggerx.Error(err)
					errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
					return
				}
			}
		}
	}

	// updating the application policy on the kavachDB
	err = tx.Model(&model.ApplicationPolicy{}).Where("id = ?", policyID).Updates(&policy).Error
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
						Object:    fmt.Sprintf("resource:org:%d:app:%d:%s", orgID, appID, permission.Resource),
						Relation:  action,
					},
					SubjectSet: model.KetoSubjectSet{
						Namespace: namespace,
						Object:    fmt.Sprintf("roles:org:%d:app:%d", orgID, appID),
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
	renderx.JSON(w, http.StatusOK, nil)
}
