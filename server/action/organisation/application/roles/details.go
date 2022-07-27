package roles

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/user"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// details - Get OrganisationRole by id
// @Summary Show a OrganisationROle by id
// @Description Get OrganisationRole by ID
// @Tags Spaces
// @ID get-application-role-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Success 200 {object} model.OrganisationRole
// @Router /organisations/{organisation_id}/applications/{application_id}/role/{role_id} [get]
func details(w http.ResponseWriter, r *http.Request) {
	// Get user id from request header
	userID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// Get organisation id from path
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

	// Get role id from path
	roleID := chi.URLParam(r, "role_id")
	roleIDInt, err := strconv.Atoi(roleID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// initiating a transaction
	tx := model.DB.Begin()
	// VERIFY WHETHER THE USER IS PART OF APPLICATION OR NOT
	isAuthorised, err := user.IsUserAuthorised(
		namespace,
		fmt.Sprintf("org:%d:app:%d", orgID, appID),
		fmt.Sprintf("%d", userID),
	)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}
	if !isAuthorised {
		tx.Rollback()
		loggerx.Error(errors.New("user is not part of the application"))
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// Get application role
	role := &model.ApplicationRole{}
	err = model.DB.Model(&model.ApplicationRole{}).Where(&model.ApplicationRole{
		ApplicationID: uint(appID),
		Base: model.Base{
			ID: uint(roleIDInt),
		},
	}).First(role).Preload("Application").Preload("Users").Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}
	tx.Commit()
	renderx.JSON(w, http.StatusOK, role)
}
