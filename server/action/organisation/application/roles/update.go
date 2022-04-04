package roles

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util"
	"github.com/factly/kavach-server/util/application"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
)

//create - Update role for an application using application_id
// @Summary Update role for an organisation using application_id
// @Description Update role for an organisation using application_id
// @Tags ApplicationRoles
// @ID update-application-role
// @Produce  json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Application ID"
// @Param organisation_id path string true "Application ID"
// @Param OrganisationRoleBody body model.OrganisationRole true "Organisation role Body"
// @Success 200 {object} model.OrganisationRole
// @Router /organisations/{organisation_id}/roles/{role_id} [put]
func update(w http.ResponseWriter, r *http.Request) {
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

	// Get role id from path
	roleID := chi.URLParam(r, "role_id")
	roleIDInt, err := strconv.Atoi(roleID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// 	Get application id from path
	applicationID := chi.URLParam(r, "application_id")
	appID, err := strconv.Atoi(applicationID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// check whether user is owner or not
	err = util.CheckOwner(uint(userID), uint(orgID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// check whether user is part of application or not
	flag := application.CheckAuthorisation(uint(appID), uint(userID))
	if !flag {
		loggerx.Error(errors.New("user is not part of application"))
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// Bind application role
	appRole := &model.ApplicationRole{}
	if err := json.NewDecoder(r.Body).Decode(&appRole); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}
	appRole.ApplicationID = uint(appID)
	appRole.ID = uint(roleIDInt)
	// Validate application role
	validationError := validationx.Check(appRole)
	if validationError != nil {
		errorx.Render(w, validationError)
		return
	}
	fmt.Println("this is role", appRole)
	//update the application role
	err = model.DB.Model(&model.ApplicationRole{}).Where("application_id = ? AND id = ?", appID, roleIDInt).Updates(appRole).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusOK, appRole)
}
