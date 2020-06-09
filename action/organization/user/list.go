package user

import (
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// list return all user in organization
func list(w http.ResponseWriter, r *http.Request) {
	organizationID := chi.URLParam(r, "organization_id")
	orgID, err := strconv.Atoi(organizationID)

	if err != nil {
		return
	}

	// check the permission of host
	host := &model.OrganizationUser{}
	hostID, _ := strconv.Atoi(r.Header.Get("X-User"))

	err = model.DB.Model(&model.OrganizationUser{}).Where(&model.OrganizationUser{
		OrganizationID: uint(orgID),
		UserID:         uint(hostID),
	}).First(host).Error

	if err != nil {
		return
	}

	var users []model.OrganizationUser

	model.DB.Model(&model.OrganizationUser{}).Where(&model.OrganizationUser{
		OrganizationID: uint(orgID),
	}).Preload("User").Find(&users)

	renderx.JSON(w, http.StatusOK, users)
}
