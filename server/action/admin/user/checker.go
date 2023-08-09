package user

import (
	"encoding/json"
	"net/http"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"gorm.io/gorm"
)

type payload struct {
	Email string `json:"email"`
}

// create organisation
func checker(w http.ResponseWriter, r *http.Request) {
	payload := &payload{}

	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}
	user := model.User{}

	// check whether user exists
	err = model.DB.Model(&model.User{}).Where(&model.User{
		Email: payload.Email,
	}).First(&user).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			renderx.JSON(w, http.StatusNotFound, nil)
			return
		}
		renderx.JSON(w, http.StatusInternalServerError, nil)
		return
	}

	renderx.JSON(w, http.StatusOK, user)
}
