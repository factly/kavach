package user

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/application"
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

	rID := chi.URLParam(r, "role_id")
	roleID, err := strconv.Atoi(rID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// check if the user if part of application or not
	flag := application.CheckAuthorisation(uint(appID), uint(userID))
	if !flag {
		loggerx.Error(errors.New("user is not part of application"))
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// get role using role id
	appRole := new(model.ApplicationRole)
	err = model.DB.Model(&model.ApplicationRole{}).Where(&model.ApplicationRole{
		Base: model.Base{
			ID: uint(roleID),
		},
		ApplicationID: uint(appID),
	}).Preload("Users").Find(appRole).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// send JSON response
	renderx.JSON(w, http.StatusAccepted, appRole.Users)
}
