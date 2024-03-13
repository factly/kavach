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
)

func Validate(w http.ResponseWriter, r *http.Request) {

	tokenBody := model.ValidationBody{}
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

	spaceToken := model.SpaceToken{}
	err = model.DB.Model(&model.SpaceToken{}).Where(&model.SpaceToken{
		Token: tokenBody.Token,
	}).First(&spaceToken).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	renderx.JSON(w, http.StatusOK, map[string]interface{}{"valid": true})
}
