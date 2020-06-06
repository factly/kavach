package organization

import (
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/render"
)

// list return all organizations
func list(w http.ResponseWriter, r *http.Request) {
	var organizations []model.Organization

	var ids []int64

	var organizationUser []model.OrganizationUser

	userID, _ := strconv.Atoi(r.Header.Get("X-User"))

	model.DB.Model(&model.OrganizationUser{}).Where(&model.OrganizationUser{
		UserID: uint(userID),
	}).Find(&organizationUser)

	mapOrgIDWithRole := make(map[uint]model.OrganizationUser)

	for _, s := range organizationUser {
		ids = append(ids, int64(s.OrganizationID))
		mapOrgIDWithRole[s.OrganizationID] = s
	}

	model.DB.Model(&model.Organization{}).Where(ids).Find(&organizations)

	result := []orgWithRole{}

	for _, each := range organizations {
		temp := orgWithRole{}
		temp.Organization = each
		temp.Permission = mapOrgIDWithRole[each.ID]
		result = append(result, temp)
	}

	render.JSON(w, http.StatusOK, result)
}
