package token

import (
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// delete - Delete organisation token by id
// @Summary Delete a organisation token
// @Description Delete organisation token by ID
// @Tags OrganisationTokens
// @ID delete-organisation-token-by-id
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param token_id path string true "Token ID"
// @Success 200
// @Router /organisations/{organisation_id}/tokens/{token_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {
	tokenID := chi.URLParam(r, "token_id")
	tokID, err := strconv.Atoi(tokenID)
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

	err = util.CheckOwner(uint(uID), uint(oID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	result := &model.OrganisationToken{}
	result.ID = uint(tokID)
	
	//check if organisation token exists
	err = model.DB.Model(&model.OrganisationToken{}).Where(&model.OrganisationToken{
		Base: model.Base{
			ID: uint(tokID),
		},
		OrganisationID: uint(oID),
	}).First(&result).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	//deleting the record
	err = model.DB.Delete(&result).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	renderx.JSON(w, http.StatusOK, nil)
}
