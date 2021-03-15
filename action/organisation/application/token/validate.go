package token

import (
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
)

// ValidationBody request body
type ValidationBody struct {
	SecretToken string `json:"secret_token" validate:"required"`
	AccessToken string `json:"access_token" validate:"required"`
}

// Validate - validate application token
// @Summary Show a application token
// @Description validate application token
// @Tags OrganisationApplicationsTokens
// @ID validate-organisation-application-token
// @Produce  json
// @Param application_slug path string true "Application Slug"
// @Param ValidationBody body ValidationBody true "Validation Body"
// @Success 200 {object} model.Application
// @Router /applications/{application_slug}/validateToken [post]
func Validate(w http.ResponseWriter, r *http.Request) {
	appSlug := chi.URLParam(r, "application_slug")
	if appSlug == "" {
		errorx.Render(w, errorx.Parser(errorx.GetMessage("invalid slug", http.StatusBadRequest)))
		return
	}

	tokenBody := ValidationBody{}
	err := json.NewDecoder(r.Body).Decode(&tokenBody)
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

	app := model.Application{}
	err = model.DB.Model(&model.Application{}).Where("slug LIKE ?", appSlug+"%").First(&app).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	appToken := model.ApplicationToken{}
	// Fetch all tokens for a application
	err = model.DB.Model(&model.ApplicationToken{}).Where(&model.ApplicationToken{
		AccessToken:   tokenBody.AccessToken,
		ApplicationID: &app.ID,
	}).First(&appToken).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	if ValidateSecretToken(tokenBody.SecretToken, appToken.HashedToken) {
		renderx.JSON(w, http.StatusOK, map[string]interface{}{"valid": true})
	} else {
		renderx.JSON(w, http.StatusUnauthorized, map[string]interface{}{"valid": false})
	}
}

// ValidateSecretToken validates the given secretToken with storedToken
func ValidateSecretToken(secretToken, storedToken string) bool {
	hasher := md5.New()
	_, _ = hasher.Write([]byte(secretToken))

	hashedSecret := hex.EncodeToString(hasher.Sum(nil))
	fmt.Println(hashedSecret)

	return hashedSecret == storedToken
}
