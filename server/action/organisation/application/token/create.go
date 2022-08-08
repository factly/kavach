package token

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/requestx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
	"github.com/spf13/viper"
)

type kratosIdentity struct {
	ID     string `json:"id,omitempty"`
	Traits struct {
		Email string `json:"email,omitempty"`
	} `json:"traits,omitempty"`
}

// create - Create application token by id
// @Summary Show a application token by id
// @Description Create application token by ID
// @Tags OrganisationApplicationsTokens
// @ID create-organisation-application-token
// @Produce  json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param application_id path string true "Application ID"
// @Param ApplicationTokenBody body applicationToken true "Application Token Body"
// @Success 200 {object} model.ApplicationToken
// @Router /organisations/{organisation_id}/applications/{application_id}/tokens [post]
func create(w http.ResponseWriter, r *http.Request) {
	applicationID := chi.URLParam(r, "application_id")
	appID, err := strconv.Atoi(applicationID)
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

	uID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	appTok := createAppToken{}
	err = json.NewDecoder(r.Body).Decode(&appTok)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(appTok)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	// Check if user is owner of organisation
	permission := &model.OrganisationUser{}
	err = model.DB.Model(&model.OrganisationUser{}).Preload("User").Where(&model.OrganisationUser{
		OrganisationID: uint(oID),
		UserID:         uint(uID),
		Role:           "owner",
	}).First(permission).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	result := model.Application{}
	result.ID = uint(appID)

	// Check if application record exists
	err = model.DB.Where(&model.Application{
		OrganisationID: uint(oID),
	}).First(&result).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	// Get user identity id from kratos
	res, err := requestx.Request("GET", viper.GetString("kratos_admin_url")+"/identities", nil, nil)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	var identities []kratosIdentity

	if err = json.NewDecoder(res.Body).Decode(&identities); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	userEmail := permission.User.Email
	var identity string

	for _, id := range identities {
		if id.Traits.Email == userEmail {
			identity = id.ID
		}
	}

	token := util.GenerateSecretToken(fmt.Sprint(result.ID, ":", result.Slug, ":", identity))

	err = model.DB.Create(&model.ApplicationToken{
		Name:          appTok.Name,
		Description:   appTok.Description,
		Token:         token,
		ApplicationID: result.ID,
	}).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	response := map[string]interface{}{
		"name": appTok.Name,
		"description": appTok.Description,
		"token": token,
	}

	renderx.JSON(w, http.StatusCreated, response)
}
