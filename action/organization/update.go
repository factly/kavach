package organization

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/identity/model"
	"github.com/factly/identity/util/render"
	"github.com/go-chi/chi"
)

func update(w http.ResponseWriter, r *http.Request) {

	req := &model.Organization{}
	json.NewDecoder(r.Body).Decode(&req)

	organizationID := chi.URLParam(r, "organization_id")
	orgID, err := strconv.Atoi(organizationID)

	organization := &model.Organization{}
	organization.ID = uint(orgID)

	// check record exists or not
	err = model.DB.First(&organization).Error
	if err != nil {
		return
	}

	// check the permission of host
	hostID, _ := strconv.Atoi(r.Header.Get("X-User"))
	permission := &model.OrganizationUser{}

	err = model.DB.Model(&model.OrganizationUser{}).Where(&model.OrganizationUser{
		OrganizationID: uint(orgID),
		UserID:         uint(hostID),
		Role:           "owner",
	}).First(permission).Error

	if err != nil {
		return
	}

	// delete
	model.DB.Model(&organization).Updates(model.Organization{
		Title: req.Title,
	}).First(&organization)

	result := &orgWithRole{}
	result.Organization = *organization
	result.Permission = *permission

	render.JSON(w, http.StatusOK, result)
}
