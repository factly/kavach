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
	"github.com/factly/kavach-server/util/keto"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
)

//create - Create role for an application using organisation_id
// @Summary Create role for an application using organisation_id
// @Description Create role for an application using organisation_id
// @Tags Organisationroles
// @ID create-organisation-role
// @Produce  json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param OrganisationRoleBody body model.OrganisationRole true "Organisation role Body"
// @Success 200 {object} model.Organisationrole
// @Router /organisations/{organisation_id}/application/{application_id}/roles [post]
func create(w http.ResponseWriter, r *http.Request) {
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

	// Bind application role
	appRole := &model.ApplicationRole{}
	if err := json.NewDecoder(r.Body).Decode(&appRole); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	// Validate application role
	validationError := validationx.Check(appRole)
	if validationError != nil {
		errorx.Render(w, validationError)
		return
	}

	// validating slug
	var count int64
	err = model.DB.Model(&model.ApplicationRole{}).Find(model.ApplicationRole{
		Slug: appRole.Slug,
	}).Count(&count).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	if count > 0 {
		loggerx.Error(errors.New("application role slug already exists"))
		errorx.Render(w, errorx.Parser(errorx.SameNameExist()))
		return
	}

	// Check if user is owner of organisation
	if err := util.CheckOwner(uint(userID), uint(orgID)); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// check if the user if part of application or not
	flag := application.CheckAuthorisation(uint(appID), uint(userID))
	if !flag {
		loggerx.Error(errors.New("user is not part of application"))
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// Create application role
	appRole.ApplicationID = uint(appID)
	appRole.CreatedByID = uint(userID)
	appRole.Users = append(appRole.Users, model.User{
		Base: model.Base{
			ID: uint(userID),
		},
	})

	err = model.DB.Model(&model.ApplicationRole{}).Create(appRole).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// Creating role in keto
	reqRole := &model.Role{}
	reqRole.ID = "roles:org:" + fmt.Sprint(orgID) + ":app:" + fmt.Sprint(appID) + ":" + appRole.Name
	reqRole.Description = appRole.Description
	reqRole.Members = []string{fmt.Sprint(userID)}

	err = keto.UpdateRole("/engines/acp/ory/regex/roles", reqRole)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.NetworkError()))
		return
	}
	renderx.JSON(w, http.StatusOK, nil)
}
