package user

import (
	"errors"
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

// create - add a user to the organisation role
// @Summary add a user to the organisation role
// @Description create organisation role user
// @Tags ApplicationRoleUsers
// @ID delete-a-organisation-role-users
// @Produce json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Success 200 {object} nil
// @Router /organisations/{organisation_id}/roles/{role_id}/users/{user_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {
	userID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	organisationID := chi.URLParam(r, "organisation_id")
	orgID, err := strconv.Atoi(organisationID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// get role-id from the path parameter
	rID := chi.URLParam(r, "role_id")
	roleID, err := strconv.Atoi(rID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// check whether user is owner in the organisation or not
	err = util.CheckOwner(uint(userID), uint(orgID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// get user ID of the user to be deleted
	delUID := chi.URLParam(r, "user_id")
	delUserID, err := strconv.Atoi(delUID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}
	tx := model.DB.Begin()
	// getting the organisation role
	orgRole := new(model.OrganisationRole)
	err = tx.Model(&model.OrganisationRole{}).Where(&model.OrganisationRole{
		Base: model.Base{
			ID: uint(roleID),
		},
		OrganisationID: uint(orgID),
	}).Preload("Users").Find(orgRole).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	users := make([]model.User, 0)

	// checking whether the user deleting is part of role or not
	var flag bool
	tuple := &model.KetoRelationTupleWithSubjectID{
		KetoSubjectSet: model.KetoSubjectSet{
			Namespace: namespace,
			Object:    fmt.Sprintf("roles:org:%d", orgID),
			Relation:  orgRole.Name,
		},
		SubjectID: fmt.Sprintf("%d", userID),
	}
	flag, err = keto.CheckKetoRelationTupleWithSubjectID(tuple)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	if !flag {
		tx.Rollback()
		loggerx.Error(errors.New("user trying to delete is not part of organisation role"))
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	// checking whether the user to be deleted is part of organisation-role or not
	tuple = &model.KetoRelationTupleWithSubjectID{
		KetoSubjectSet: model.KetoSubjectSet{
			Namespace: namespace,
			Object:    fmt.Sprintf("roles:org:%d:%d", orgID, roleID),
			Relation:  orgRole.Name,
		},
		SubjectID: fmt.Sprintf("%d", delUserID),
	}

	flag, err = keto.CheckKetoRelationTupleWithSubjectID(tuple)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	if !flag {
		tx.Rollback()
		loggerx.Error(errors.New("user to be deleted is not part of organisation role"))
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	err = model.DB.Model(&orgRole).Association("Users").Replace(&users)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// Deleting the all the relation tuple related to "orgnanisation-role"
	err = keto.DeleteRelationTupleWithSubjectID(tuple)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	tx.Commit()
	renderx.JSON(w, http.StatusOK, nil)
}
