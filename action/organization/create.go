package organization

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/identity/model"
	"github.com/factly/identity/util/render"
)

// create create organization
func create(w http.ResponseWriter, r *http.Request) {
	organization := &model.Organization{}

	json.NewDecoder(r.Body).Decode(&organization)

	err := model.DB.Model(&model.Organization{}).Create(&organization).Error

	if err != nil {
		return
	}

	userID, _ := strconv.Atoi(r.Header.Get("X-User"))

	err = model.DB.Model(&model.OrganizationUser{}).Create(&model.OrganizationUser{
		OrganizationID: organization.ID,
		UserID:         uint(userID),
		Role:           "owner",
	}).Error

	render.JSON(w, http.StatusCreated, organization)
}
