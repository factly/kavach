package organisation

import (
	"encoding/json"
	"net/http"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"gorm.io/gorm"
)

func info_token(w http.ResponseWriter, r *http.Request) {
	tokenBody := validationBody{}

	err := json.NewDecoder(r.Body).Decode(&tokenBody)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	orgToken := model.OrganisationToken{}
	// to need to specify the organisation id as token itself is unique
	err = model.DB.Model(&model.OrganisationToken{}).Preload("Organisation").Where(&model.OrganisationToken{
		Token: tokenBody.Token,
	}).First(&orgToken).Error

	if err != nil {
		loggerx.Error(err)
		if err == gorm.ErrRecordNotFound {
			renderx.JSON(w, http.StatusUnauthorized, map[string]interface{}{"valid": false})
			return
		}
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	renderx.JSON(w, http.StatusOK, map[string]interface{}{"valid": true, "organisation_id": orgToken.OrganisationID, "token_id": orgToken.ID})
}
