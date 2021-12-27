package token

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// delete - Delete application token by id
// @Summary Delete a applicationa token
// @Description Delete application token by ID
// @Tags OrganisationApplicationsTokens
// @ID delete-application-token-by-id
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param application_id path string true "Application ID"
// @Param token_id path string true "Token ID"
// @Success 200
// @Router /organisations/{organisation_id}/applications/{application_id}/tokens/{token_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {
	applicationID := chi.URLParam(r, "application_id")
	appID, err := strconv.Atoi(applicationID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	tokenID := chi.URLParam(r, "token_id")
	tokID, err := strconv.Atoi(tokenID)
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
		OrganisationID: sql.NullInt32{
			Int32: int32(oID),
			Valid: true,
		},
		UserID: uint(uID),
		Role:   "owner",
	}).First(permission).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	result := model.ApplicationToken{}
	result.ID = uint(tokID)
	uintAppID := uint(appID)

	// Check if application token record exists
	err = model.DB.Where(&model.ApplicationToken{
		ApplicationID: &uintAppID,
	}).First(&result).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	model.DB.Delete(&result)

	renderx.JSON(w, http.StatusOK, nil)
}
