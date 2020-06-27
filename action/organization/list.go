package organization

import (
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/renderx"
)

// list return all organizations
func list(w http.ResponseWriter, r *http.Request) {
	var organizationUser []model.OrganizationUser

	userID, err := strconv.Atoi(r.Header.Get("X-User"))

	if err != nil {
		renderx.JSON(w, http.StatusBadRequest, nil)
		return
	}

	model.DB.Model(&model.OrganizationUser{}).Where(&model.OrganizationUser{
		UserID: uint(userID),
	}).Preload("Organization").Find(&organizationUser)

	result := []orgWithRole{}

	for _, each := range organizationUser {
		eachOrg := orgWithRole{}
		eachOrg.Organization = *each.Organization
		eachOrg.Permission = each

		eachOrg.Permission.Organization = nil

		result = append(result, eachOrg)
	}

	renderx.JSON(w, http.StatusOK, result)
}
