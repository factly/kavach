package user

import (
	"net/http"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/renderx"
)

// list return all organisations
func list(w http.ResponseWriter, r *http.Request) {
	var users []model.User

	model.DB.Model(&model.User{}).Find(&users)

	renderx.JSON(w, http.StatusOK, users)
}
