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

	permission := model.OrganizationUser{}
	permission.OrganizationID = organization.ID
	permission.UserID = uint(userID)
	permission.Role = "owner"

	err = model.DB.Model(&model.OrganizationUser{}).Create(&permission).Error

	result := orgWithRole{}
	result.Organization = *organization
	result.Permission = permission

	render.JSON(w, http.StatusCreated, result)
}
