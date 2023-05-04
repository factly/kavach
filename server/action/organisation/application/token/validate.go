package token

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
)

// ValidationBody request body
type ValidationBody struct {
	Token string `json:"token" validate:"required"`
}

// Validate - validate application token
// @Summary Show a application token
// @Description validate application token
// @Tags OrganisationApplicationsTokens
// @ID validate-organisation-application-token
// @Produce  json
// @Param X-Organisation  header string true "Organisation ID"
// @Param application_slug path string true "Application Slug"
// @Param ValidationBody body ValidationBody true "Validation Body"
// @Success 200 {object} model.Application
// @Router /applications/{application_id}/tokens/validate [post]
func validate(w http.ResponseWriter, r *http.Request) {
	applicaion_id := chi.URLParam(r, "application_id")
	// if applicaion_id == "" {
	// 	errorx.Render(w, errorx.Parser(errorx.GetMessage("invalid id", http.StatusBadRequest)))
	// 	return
	// }
	id, err := strconv.ParseUint(applicaion_id, 10, 64)
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.GetMessage("invalid id", http.StatusBadRequest)))
		return
	}
	//parse applicaion_id
	orgID, err := strconv.Atoi(r.Header.Get("X-Organisation"))
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	tokenBody := ValidationBody{}
	err = json.NewDecoder(r.Body).Decode(&tokenBody)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(tokenBody)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	appToken := model.ApplicationToken{}
	// Fetch all tokens for a application
	err = model.DB.Model(&model.ApplicationToken{}).Preload("Application").Where(&model.ApplicationToken{
		Token: tokenBody.Token,
	}).First(&appToken).Error

	if err != nil || appToken.ApplicationID != uint(id) || appToken.Application.OrganisationID != uint(orgID) {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	if tokenBody.Token == appToken.Token {
		renderx.JSON(w, http.StatusOK, map[string]interface{}{"valid": true})
	} else {
		renderx.JSON(w, http.StatusUnauthorized, map[string]interface{}{"valid": false})
	}
}
