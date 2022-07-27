package policy

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util"
	"github.com/factly/kavach-server/util/keto/relationTuple"
	"github.com/factly/kavach-server/util/user"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

func delete(w http.ResponseWriter, r *http.Request) {
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

	// Get policy id path parameter
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

	policy := new(model.ApplicationPolicy)
	err = model.DB.Where(&model.ApplicationPolicy{
		Base: model.Base{
			ID: uint(policyID),
		},
	}).Preload("Roles").First(policy).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}
	//------------- deleting from the kavachDB -------------
	tx := model.DB.Begin()
	err = model.DB.Delete(&model.ApplicationPolicy{}, policyID).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// ---------------- Delete policy from the keto server -----------------
	var permissions []permission
	err = json.Unmarshal(policy.Permissions.RawMessage, &permissions)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	for _, role := range policy.Roles {
		for _, permission := range permissions {
			for _, action := range permission.Actions {
				tuple := &model.KetoRelationTupleWithSubjectSet{
					KetoSubjectSet: model.KetoSubjectSet{
						Namespace: namespace,
						Object:    fmt.Sprintf("resource:org:%d:app:%d:%s", orgID, appID,permission.Resource),
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

	tx.Commit() // commiting the transaction
	// send JSON response
	renderx.JSON(w, http.StatusOK, nil)

}
