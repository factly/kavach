package organization

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/identity/model"
	"github.com/factly/identity/util/render"
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

	for _, s := range organizationUser {
		ids = append(ids, int64(s.OrganizationID))
	}
	fmt.Println(ids)
	model.DB.Model(&model.Organization{}).Where(ids).Find(&organizations)

	render.JSON(w, http.StatusOK, organizations)
}
