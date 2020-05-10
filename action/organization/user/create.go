package user

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/identity/model"
	"github.com/factly/identity/util/render"
	"github.com/go-chi/chi"
)

type invite struct {
	Email string `json:"email"`
	Role  string `json:"role"`
}

// create return all user in organization
func create(w http.ResponseWriter, r *http.Request) {
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

	// FindOrCreate invitee

	req := invite{}
	json.NewDecoder(r.Body).Decode(&req)

	invitee := model.User{}

	model.DB.FirstOrCreate(&invitee, &model.User{
		Email: req.Email,
	})

	// Add user into organization
	organizationUser := &model.OrganizationUser{}

	organizationUser.OrganizationID = uint(orgID)
	organizationUser.UserID = invitee.ID
	organizationUser.Role = req.Role

	err = model.DB.Model(&model.OrganizationUser{}).Create(&organizationUser).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusCreated, organizationUser)
}
