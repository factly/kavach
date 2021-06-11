package token

import (
	"crypto/md5"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/requestx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
	"github.com/spf13/viper"
	"golang.org/x/crypto/bcrypt"
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

	orgnaisationID := chi.URLParam(r, "organisation_id")
	oID, err := strconv.Atoi(orgnaisationID)
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

	appTok := applicationToken{}
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

	accessToken := GenerateIDToken(32)
	token, hash := GenerateSecretToken(fmt.Sprint(accessToken, ":", result.ID, ":", result.Slug, ":", identity))

	err = model.DB.Create(&model.ApplicationToken{
		Name:          appTok.Name,
		Description:   appTok.Description,
		AccessToken:   accessToken,
		HashedToken:   hash,
		ApplicationID: &result.ID,
	}).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	response := map[string]interface{}{
		"secret_token": token,
		"access_token": accessToken,
	}

	renderx.JSON(w, http.StatusCreated, response)
}

// GenerateIDToken generated ID token for application
func GenerateIDToken(length int) string {
	b := make([]byte, length)
	if _, err := rand.Read(b); err != nil {
		return ""
	}
	return hex.EncodeToString(b)
}

// GenerateSecretToken generates secret token for application
func GenerateSecretToken(str string) (string, string) {
	hash, err := bcrypt.GenerateFromPassword([]byte(str), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal(err)
	}

	hasher := md5.New()
	_, _ = hasher.Write(hash)
	return string(hash), hex.EncodeToString(hasher.Sum(nil))
}
