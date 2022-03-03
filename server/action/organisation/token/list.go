package token

import (
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// list - List organisation tokens
// @Summary List organisation tokens
// @Description Show a organisation tokens
// @Tags OrganisationTokens
// @ID get-organisation-tokens
// @Produce  json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Success 200 {object} []model.OrganisationToken
// @Router /organisations/{organisation_id}/tokens [get]
func list(w http.ResponseWriter, r *http.Request) {
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

	// Check if user is part of organisation
	permission := &model.OrganisationUser{}
	err = model.DB.Model(&model.OrganisationUser{}).Where(&model.OrganisationUser{
		OrganisationID: uint(oID),
		UserID:         uint(uID),
	}).First(permission).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	tokens := make([]model.OrganisationToken, 0)
	orgID := new(uint)
	*orgID = uint(oID)
	err = model.DB.Model(&model.OrganisationToken{}).Where(&model.OrganisationToken{
		OrganisationID: orgID,
	}).Preload("Organisation").Find(&tokens).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusOK, tokens)
}
