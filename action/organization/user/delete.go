package user

import (
	"net/http"
	"strconv"

	"github.com/factly/identity/model"
	"github.com/factly/identity/util/render"
	"github.com/go-chi/chi"
)

// create return all user in organization
func delete(w http.ResponseWriter, r *http.Request) {
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
		Role:           "owner",
	}).First(host).Error

	if err != nil {
		return
	}

	permissionID := chi.URLParam(r, "permission_id")
	pID, errPermission := strconv.Atoi(permissionID)

	if errPermission != nil {
		return
	}

	result := &model.OrganizationUser{}
	result.ID = uint(pID)
	result.OrganizationID = uint(orgID)

	model.DB.Model(&model.OrganizationUser{}).Delete(result)

	render.JSON(w, http.StatusOK, nil)
}
