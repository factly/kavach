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

// list - Get all role uses
// @Summary Show all role users
// @Description Get all role users
// @Tags OrganisationRoleUsers
// @ID get-all-organisation-role-users
// @Produce json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Success 200 {array} model.OrganisationRole
// @Router /organisations/{organisation_id}/roles/{role_id}/users [get]
func list(w http.ResponseWriter, r *http.Request) {
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

	rID := chi.URLParam(r, "role_id")
	roleID, err := strconv.Atoi(rID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	roleName, err := util.GetOrganisationRoleByID(uint(roleID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	tuple := &model.KetoRelationTupleWithSubjectID{
		KetoSubjectSet: model.KetoSubjectSet{
			Namespace: namespace,
			Object:    fmt.Sprintf("roles:org:%d:%d", orgID, roleID),
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
			loggerx.Error(errors.New("user trying to list is not part of organisation role"))
			errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
			return
		}
	}

	userIDs, err := keto.ListSubjectsByObjectID(namespace, *roleName, fmt.Sprintf("roles:org:%d", orgID))
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
