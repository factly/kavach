package user

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	keto "github.com/factly/kavach-server/util/keto/relationTuple"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// list - Get all organisations users (admin)
// @Summary Show all organisations users (admin)
// @Description Get all organisations users (admin)
// @Tags AdminOrganisationUser
// @ID get-all-admin-organisations-users
// @Produce  json
// @Param X-KAVACH-MASTER-KEY header string true "Master Key"
// @Param organisation_id path string true "Organisation ID"
// @Success 200 {array} []userWithPermission
// @Router /admin/organisations/{organisation_id}/users [get]
func list(w http.ResponseWriter, r *http.Request) {
	organisationID := chi.URLParam(r, "organisation_id")
	orgID, err := strconv.Atoi(organisationID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	role := r.URL.Query().Get("role")

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
