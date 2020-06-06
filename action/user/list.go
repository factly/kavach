package user

import (
	"net/http"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/render"
)

// list return all organizations
func list(w http.ResponseWriter, r *http.Request) {
	var users []model.User

	model.DB.Model(&model.User{}).Find(&users)

	render.JSON(w, http.StatusOK, users)
}
