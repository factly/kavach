package user

import (
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

// create - add a user to the organisation role
// @Summary add a user to the organisation role
// @Description create organisation role user
// @Tags SpaceRoleUsers
// @ID delete-a-space-role-users
// @Produce json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Success 200 {object} nil
// @Router /organisations/{organisation_id}/applications/{application_id}/spaces/{space_id}/roles/{role_id}/users/{user_id} [delete]
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

	// Get application id from path
	applicationID := chi.URLParam(r, "application_id")
	appID, err := strconv.Atoi(applicationID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	sID := chi.URLParam(r, "space_id")
	spaceID, err := strconv.Atoi(sID)
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

	//  WHETHER THE USER IS PART OF space OR NOT
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

	// get user ID of the user to be deleted
	delUID := chi.URLParam(r, "user_id")
	delUserID, err := strconv.Atoi(delUID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	tx := model.DB.Begin()
	// getting the space role
	spaceRole := new(model.SpaceRole)
	err = tx.Model(&model.SpaceRole{}).Where(&model.SpaceRole{
		Base: model.Base{
			ID: uint(roleID),
		},
		SpaceID: uint(spaceID),
	}).Preload("Users").Find(spaceRole).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	var flag bool
	users := make([]model.User, 0)
	flag = false

	for _, user := range spaceRole.Users {
		if user.ID == uint(delUserID) {
			flag = true
		} else {
			users = append(users, user)
		}
	}

	// if user not found for application
	if !flag {
		tx.Rollback()
		loggerx.Error(errors.New("user to be deleted is not part of organisation role"))
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	err = tx.Model(&spaceRole).Association("Users").Replace(&users)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tuple := &model.KetoRelationTupleWithSubjectID{
		KetoSubjectSet: model.KetoSubjectSet{
			Namespace: namespace,
			Object:    fmt.Sprintf("roles:org:%d:app:%d:space:%d", orgID, appID, spaceID),
			Relation:  spaceRole.Name,
		},
		SubjectID: fmt.Sprintf("%d", delUserID),
	}

	err = keto.DeleteRelationTupleWithSubjectID(tuple)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Commit()
	renderx.JSON(w, http.StatusOK, nil)
}
