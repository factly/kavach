package organization

import (
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

func details(w http.ResponseWriter, r *http.Request) {

	organizationID := chi.URLParam(r, "organization_id")
	id, err := strconv.Atoi(organizationID)

	if err != nil {
		return
	}
	var permission model.OrganizationUser

	userID, _ := strconv.Atoi(r.Header.Get("X-User"))

	model.DB.Model(&model.OrganizationUser{}).Where(&model.OrganizationUser{
		UserID:         uint(userID),
		OrganizationID: uint(id),
	}).First(&permission)

	organization := &model.Organization{}
	organization.ID = uint(id)

	err = model.DB.Model(&model.Organization{}).First(&organization).Error

	if err != nil {
		return
	}

	result := orgWithRole{}

	result.Organization = *organization
	result.Permission = permission

	renderx.JSON(w, http.StatusOK, result)
}
