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

// list - Get all application role users
// @Summary Show all application role users
// @Description Get all application role users
// @Tags ApplicationRoleUsers
// @ID get-all-application-role-users
// @Produce json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Success 200 {array} []model.User
// @Router /organisations/{organisation_id}/applications/{application_id}/roles/{role_id}/users [get]
func list(w http.ResponseWriter, r *http.Request) {
	userID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	applicationID := chi.URLParam(r, "application_id")
	appID, err := strconv.Atoi(applicationID)
	if err != nil {
		loggerx.Error(err)
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

	rID := chi.URLParam(r, "role_id")
	roleID, err := strconv.Atoi(rID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// VERIFY WHETHER THE USER IS PART OF Application OR NOT
	isAuthorised, err := user.IsUserAuthorised(
		namespace,
		fmt.Sprintf("org:%d:app:%d", orgID, appID),
		fmt.Sprintf("%d", userID),
	)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	if !isAuthorised {
		loggerx.Error(errors.New("user is not part of the application"))
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	roleName, err := util.GetApplicationRoleByID(uint(roleID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	tuple := &model.KetoRelationTupleWithSubjectID{
		KetoSubjectSet: model.KetoSubjectSet{
			Namespace: namespace,
			Object:    fmt.Sprintf("roles:org:%d:app:%d:%d", orgID, appID, roleID),
			Relation:  *roleName,
		},
		SubjectID: fmt.Sprintf("%d", userID),
	}

	flag, err := keto.CheckKetoRelationTupleWithSubjectID(tuple)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	isOwner := true
	err = util.CheckOwner(uint(userID), uint(orgID))
	if err != nil {
		isOwner = false
	}
	if !flag {
		if !isOwner {
			loggerx.Error(errors.New("user trying to list is not part of application role"))
			errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
			return
		}
	}

	userIDs, err := keto.ListSubjectsByObjectID(namespace, *roleName, fmt.Sprintf("roles:org:%d:app:%d", orgID, appID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	users := []model.User{}
	for _, userID := range userIDs {
		uID, err := strconv.Atoi(userID)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DecodeError()))
			return
		}

		var userModel model.User
		err = model.DB.Model(&model.User{}).Where(&model.User{
			Base: model.Base{
				ID: uint(uID),
			},
		}).Preload("Medium").First(&userModel).Error
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
		users = append(users, userModel)
	}

	// send JSON response
	renderx.JSON(w, http.StatusAccepted, users)
}
