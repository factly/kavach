package user

import (
	"context"
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

// delete - Delete application user by id
// @Summary Delete a application user
// @Description Delete application user by ID
// @Tags ApplicationUser
// @ID delete-application-user-by-id
// @Param X-User header string true "User ID"
// @Param application_id path string true "Application ID"
// @Param organisation_id path string true "Organisation ID"
// @Param user_id path string true "User ID"
// @Success 200
// @Router /organisations/{organisation_id}/applications/{application_id}/users/{user_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {
	organisationID := chi.URLParam(r, "organisation_id")
	orgID, err := strconv.Atoi(organisationID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	userID := chi.URLParam(r, "user_id")
	uID, err := strconv.Atoi(userID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	var currentUID int
	currentUID, err = strconv.Atoi(r.Header.Get("X-User"))

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	applicationID := chi.URLParam(r, "application_id")
	appID, err := strconv.Atoi(applicationID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// Check if logged in user is owner
	err = util.CheckOwner(uint(currentUID), uint(orgID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.CannotSaveChanges()))
		return
	}

	result := &model.Application{}

	result.ID = uint(appID)
	tx := model.DB.Begin()
	// Check if record exist
	err = tx.Preload("Users").First(&result).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	// VERIFY WHETHER THE USER IS PART OF Application OR NOT
	isAuthorised, err := user.IsUserAuthorised(
		namespace,
		fmt.Sprintf("org:%d:app:%d", orgID, appID),
		fmt.Sprintf("%d", uID),
	)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	if !isAuthorised {
		tx.Rollback()
		loggerx.Error(errors.New("user is not part of the application"))
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	newUsers := make([]model.User, 0)
	flag := false

	for _, user := range result.Users {
		if user.ID == uint(uID) {
			flag = true
		} else {
			newUsers = append(newUsers, user)
		}
	}

	if !flag {
		tx.Rollback()
		loggerx.Error(errors.New("unable to delete user of application"))
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}
	// Check if the user to delete is not last user of application
	if len(newUsers) < 1 {
		tx.Rollback()
		loggerx.Error(errors.New("cannot delete last user of application"))
		errorx.Render(w, errorx.Parser(errorx.CannotSaveChanges()))
		return
	}

	if err = tx.WithContext(context.WithValue(r.Context(), userContext, currentUID)).Model(&result).Association("Users").Replace(&newUsers); err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	kavachRole, err := util.GetKavachRoleByID(uint(uID), uint(orgID))
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tuple := &model.KetoRelationTupleWithSubjectID{
		KetoSubjectSet: model.KetoSubjectSet{
			Namespace: namespace,
			Object:    fmt.Sprintf("org:%d:app:%d", orgID, appID),
			Relation:  kavachRole, // relation is an empty string to avoid addition of the relation query parameter
		},
		SubjectID: fmt.Sprintf("%d", uID),
	}
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
