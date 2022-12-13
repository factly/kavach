package token

import (
	"encoding/json"
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
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
)

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
	err = util.CheckOwner(uint(uID), uint(oID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	result := model.Application{}
	result.ID = uint(appID)

	tuple := &model.KetoRelationTupleWithSubjectID{
		KetoSubjectSet: model.KetoSubjectSet{
			Namespace: namespace,
			Object:    fmt.Sprintf("org:%d:app:%d", oID, appID),
			Relation:  "owner",
		},
		SubjectID: fmt.Sprintf("%d", uID),
	}

	isAllowed, err := keto.CheckKetoRelationTupleWithSubjectID(tuple)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	if !isAllowed {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	user := model.User{}
	err = model.DB.Model(&model.User{}).Where(&model.User{
		Base: model.Base{
			ID: uint(uID),
		},
	}).Find(&user).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	token, err := util.GenerateSecretToken(fmt.Sprint(result.ID, ":", result.Slug, ":", user.KID))
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	
	err = model.DB.Create(&model.ApplicationToken{
		Name:           appTok.Name,
		Description:    appTok.Description,
		Token:          token,
		ApplicationID:  result.ID,
		OrganisationID: uint(oID),
	}).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	response := map[string]interface{}{
		"name":        appTok.Name,
		"description": appTok.Description,
		"token":       token,
	}

	renderx.JSON(w, http.StatusCreated, response)
}
