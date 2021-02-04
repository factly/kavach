package application

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util"
	"github.com/factly/kavach-server/util/keto"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
)

// create - Create organisation application
// @Summary Create organisation application
// @Description Create organisation application
// @Tags OrganisationApplications
// @ID add-organisation-application
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param Application body application true "Application Object"
// @Success 201 {object} model.Application
// @Failure 400 {array} string
// @Router /organisations/{organisation_id}/applications [post]
func create(w http.ResponseWriter, r *http.Request) {
	uID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	organisationID := chi.URLParam(r, "organisation_id")
	oID, err := strconv.Atoi(organisationID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	app := application{}
	err = json.NewDecoder(r.Body).Decode(&app)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(app)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	// Check if user is owner of organisation
	err = util.CheckOwner(uint(uID), uint(oID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	mediumID := &app.MediumID
	if app.MediumID == 0 {
		mediumID = nil
	}

	result := &model.Application{
		Name:           app.Name,
		Slug:           app.Slug,
		Description:    app.Description,
		URL:            app.URL,
		MediumID:       mediumID,
		OrganisationID: uint(oID),
	}

	// Add current user in application_users
	model.DB.Model(&model.User{}).Where(&model.User{
		Base: model.Base{
			ID: uint(uID),
		},
	}).Find(&result.Users)

	tx := model.DB.WithContext(context.WithValue(r.Context(), userContext, uID)).Begin()

	err = tx.Preload("Users").Create(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	/* creating user groups of application */
	reqRole := &model.Role{}
	reqRole.ID = "roles:org:" + fmt.Sprint(organisationID) + ":app:" + fmt.Sprint(result.ID) + ":users"
	reqRole.Members = []string{fmt.Sprint(uID)}

	err = keto.UpdateRole("/engines/acp/ory/regex/roles", reqRole)

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.NetworkError()))
		return
	}

	/* creating policy for application users */
	reqPolicy := &model.Policy{}
	reqPolicy.ID = "id:org:" + fmt.Sprint(organisationID) + ":app:" + fmt.Sprint(result.ID) + ":users"
	reqPolicy.Subjects = []string{reqRole.ID}
	reqPolicy.Resources = []string{"resources:org:" + fmt.Sprint(organisationID) + ":app:" + app.Slug + ":<.*>"}
	reqPolicy.Actions = []string{"actions:org:" + fmt.Sprint(organisationID) + ":app:" + app.Slug + ":<.*>"}
	reqPolicy.Effect = "allow"

	err = keto.UpdatePolicy("/engines/acp/ory/regex/policies", reqPolicy)

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.NetworkError()))
		return
	}

	tx.Commit()

	renderx.JSON(w, http.StatusCreated, result)
}
