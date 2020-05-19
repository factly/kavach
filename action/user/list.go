package user

import (
	"net/http"

	"github.com/factly/identity/model"
	"github.com/factly/identity/util/render"
)

// list return all organizations
func list(w http.ResponseWriter, r *http.Request) {
	var users []model.User

	model.DB.Model(&model.User{}).Find(&users)

	render.JSON(w, http.StatusOK, users)
}
