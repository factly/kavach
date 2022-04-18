package user

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util"
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

	// getting the organisation role
	orgRole := new(model.OrganisationRole)
	err = model.DB.Model(&model.OrganisationRole{}).Where(&model.OrganisationRole{
		Base: model.Base{
			ID: uint(roleID),
		},
		OrganisationID: uint(orgID),
	}).Preload("Users").Find(orgRole).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	users := make([]model.User, 0)
	flag := false

	for _, user := range orgRole.Users {
		if user.ID == uint(delUserID) {
			flag = true
		} else {
			users = append(users, user)
		}
	}

	// if user not found for application
	if !flag {
		loggerx.Error(errors.New("user to be deleted is not part of organisation role"))
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	// Check if the user to delete is not last user of application
	if len(users) < 1 {
		loggerx.Error(errors.New("cannot delete last user of organisation role"))
		errorx.Render(w, errorx.Parser(errorx.CannotSaveChanges()))
		return
	}

	err = model.DB.Model(&orgRole).Association("Users").Replace(&users); 
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusOK, nil)
}
