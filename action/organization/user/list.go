package user

import (
	"net/http"
	"strconv"

	"github.com/factly/identity/model"
	"github.com/factly/identity/util/render"
	"github.com/go-chi/chi"
)

// list return all user in organization
func list(w http.ResponseWriter, r *http.Request) {
	organizationID := chi.URLParam(r, "organization_id")
	id, err := strconv.Atoi(organizationID)

	if err != nil {
		return
	}

	var users []model.OrganizationUser

	model.DB.Model(&model.OrganizationUser{}).Where(&model.OrganizationUser{
		OrganizationID: uint(id),
	}).Preload("User").Find(&users)

	render.JSON(w, http.StatusOK, users)
}
