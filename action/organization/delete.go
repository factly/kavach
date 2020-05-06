package organization

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/identity/model"
	"github.com/go-chi/chi"
)

func delete(w http.ResponseWriter, r *http.Request) {
	organizationID := chi.URLParam(r, "organization_id")
	id, err := strconv.Atoi(organizationID)

	organization := &model.Organization{}

	organization.ID = uint(id)

	// check record exists or not
	err = model.DB.First(&organization).Error
	if err != nil {
		return
	}

	model.DB.Delete(&organization)

	json.NewEncoder(w).Encode(organization)
}
