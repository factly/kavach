package token

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"gorm.io/gorm"
)

// validationBody request body
type validationBody struct {
	Token string `json:"token" validate:"required"`
}

// Validate - validate organisation token
// @Summary Show a organisation token
// @Description validate organisation token
// @Tags OrganisationorganisationsTokens
// @ID validate-organisation-organisation-token
// @Produce  json
// @Param X-Organisation  header string true "Organisation ID"
// @Param organisation_slug path string true "Application Slug"
// @Param ValidationBody body ValidationBody true "Validation Body"
// @Success 200 {object} model.organisation
// @Router /organisations/{application_id}/tokens/validate [post]
func validate(w http.ResponseWriter, r *http.Request) {
	//parse applicaion_id

	tokenBody := validationBody{}
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

	renderx.JSON(w, http.StatusOK, map[string]interface{}{"valid": true})
}
