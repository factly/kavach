package organization

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/factly/identity/model"
	"github.com/factly/identity/util"
	"github.com/factly/identity/util/render"
)

// create create organization
func create(w http.ResponseWriter, r *http.Request) {
	req := &model.Organization{}

	json.NewDecoder(r.Body).Decode(&req)

	req.Slug = util.CreateSlug(req.Title)

	err := model.DB.Model(&model.Organization{}).Create(&req).Error

	if err != nil {
		fmt.Print(err)
		return
	}

	render.JSON(w, http.StatusCreated, req)
}
