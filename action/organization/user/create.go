package user

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/identity/model"
	"github.com/factly/identity/util/render"
	"github.com/go-chi/chi"
)

// create return all user in organization
func create(w http.ResponseWriter, r *http.Request) {
	organizationID := chi.URLParam(r, "organization_id")
	id, err := strconv.Atoi(organizationID)

	if err != nil {
		return
	}

	organizationUser := &model.OrganizationUser{}
	json.NewDecoder(r.Body).Decode(&organizationUser)

	organizationUser.OrganizationID = uint(id)

	err = model.DB.Model(&model.OrganizationUser{}).Create(&organizationUser).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusCreated, organizationUser)
}
