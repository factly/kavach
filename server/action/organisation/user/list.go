package user

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	keto "github.com/factly/kavach-server/util/keto/relationTuple"
	"github.com/factly/kavach-server/util/user"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// list - Get all organisations users
// @Summary Show all organisations users
// @Description Get all organisations users
// @Tags OrganisationUser
// @ID get-all-organisations-users
// @Produce  json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Success 200 {array} []userWithPermission
// @Router /organisations/{organisation_id}/users [get]
func list(w http.ResponseWriter, r *http.Request) {
	organisationID := chi.URLParam(r, "organisation_id")
	orgID, err := strconv.Atoi(organisationID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}
	hostID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}
	role := r.URL.Query().Get("role")
	// check whether user is part of organisation or not
	isAuthorized, err := user.IsUserAuthorised(
		"organisations",
		fmt.Sprintf("org:%d", orgID),
		fmt.Sprintf("%d", hostID),
	)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	if !isAuthorized {
		loggerx.Error(errors.New("user is not part of the organisation"))
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	var userIDs []string

	if role == "owner" || role == "member" {
		userIDs, err = keto.ListSubjectsByObjectID(namespace, role, fmt.Sprintf("org:%d", orgID))
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
			return
		}
	} else {
		userIDs, err = keto.ListSubjectsByObjectID(namespace, "", fmt.Sprintf("org:%d", orgID))
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
			return
		}
	}

	result := make([]userWithPermission, 0)
	for _, userID := range userIDs {
		var user userWithPermission

		uID, err := strconv.Atoi(userID)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DecodeError()))
			return
		}

		tx := model.DB.Begin()
		var userModel model.User
		err = tx.Model(&model.User{}).Where(&model.User{
			Base: model.Base{
				ID: uint(uID),
			},
		}).Preload("Medium").First(&userModel).Error
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}

		var userPermissions model.OrganisationUser
		err = tx.Model(&model.OrganisationUser{}).Where(&model.OrganisationUser{
			OrganisationID: uint(orgID),
			UserID:         uint(uID),
		}).First(&userPermissions).Error
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}

		user.User = userModel
		user.Permission = userPermissions
		result = append(result, user)
		tx.Commit()
	}

	renderx.JSON(w, http.StatusOK, result)
}
