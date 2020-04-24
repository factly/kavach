package actions

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/identity/models"
	"github.com/go-chi/chi"
)

func GetOrganizations(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var organizations []models.Organization

	models.DB.Model(&models.Organization{}).Find(&organizations)

	json.NewEncoder(w).Encode(organizations)
}

func CreateOrganization(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	req := &models.Organization{}

	json.NewDecoder(r.Body).Decode(&req)

	req.Slug = SlugCreater(req.Title)

	err := models.DB.Model(&models.Organization{}).Create(&req).Error

	if err != nil {
		fmt.Print(err)
		return
	}

	json.NewEncoder(w).Encode(req)
}

func DeleteOrganization(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	organizationID := chi.URLParam(r, "id")
	id, err := strconv.Atoi(organizationID)

	organization := &models.Organization{}

	organization.ID = uint(id)

	// check record exists or not
	err = models.DB.First(&organization).Error
	if err != nil {
		return
	}

	models.DB.Delete(&organization)

	json.NewEncoder(w).Encode(organization)
}
