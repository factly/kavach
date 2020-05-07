package organization

import (
	"encoding/json"
	"net/http"

	"github.com/factly/identity/model"
)

// list return all organizations
func list(w http.ResponseWriter, r *http.Request) {
	var organizations []model.Organization

	model.DB.Model(&model.Organization{}).Find(&organizations)

	json.NewEncoder(w).Encode(organizations)
}
