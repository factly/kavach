package application

import (
	"context"
	"crypto/md5"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
	"golang.org/x/crypto/bcrypt"
)

// getAPIToken - Get application token by id
// @Summary Show a application token by id
// @Description Get application token by ID
// @Tags OrganisationApplications
// @ID get-organisation-application-token-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param application_id path string true "Application ID"
// @Success 200 {object} model.Application
// @Router /organisations/{organisation_id}/applications/{application_id}/generateToken [get]
func getAPIToken(w http.ResponseWriter, r *http.Request) {
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

	// Check if user is owner of organisation
	permission := &model.OrganisationUser{}
	err = model.DB.Model(&model.OrganisationUser{}).Where(&model.OrganisationUser{
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

	accessToken := GenerateIDToken(64)
	token, hash := GenerateSecretToken(fmt.Sprint(accessToken, ":", result.ID, ":", result.Slug))

	err = model.DB.WithContext(context.WithValue(r.Context(), userContext, uID)).Model(&result).Updates(model.Application{
		HashedToken: hash,
		AccessToken: accessToken,
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

	renderx.JSON(w, http.StatusOK, response)
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
	hasher.Write(hash)
	return string(hash), hex.EncodeToString(hasher.Sum(nil))
}
