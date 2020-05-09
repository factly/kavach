package organization

import (
	"net/http"

	"github.com/factly/identity/model"
	"github.com/factly/identity/util/render"
)

// list return all organizations
func list(w http.ResponseWriter, r *http.Request) {
	var organizations []model.Organization

	model.DB.Model(&model.Organization{}).Find(&organizations)

	render.JSON(w, http.StatusOK, organizations)
}
