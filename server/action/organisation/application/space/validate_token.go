package space

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
)

func validate_token(w http.ResponseWriter, r *http.Request) {

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
	fmt.Println(tokenBody.Token)

	spaceToken := model.SpaceToken{}
	err = model.DB.Model(&model.SpaceToken{}).Where(&model.SpaceToken{
		Token: tokenBody.Token,
	}).First(&spaceToken).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.GetMessage("invalid space token", 403)))
		return
	}

	renderx.JSON(w, http.StatusOK, map[string]interface{}{"valid": true})
}
