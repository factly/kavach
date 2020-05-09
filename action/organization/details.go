package organization

import (
	"net/http"
	"strconv"

	"github.com/factly/identity/model"
	"github.com/factly/identity/util/render"
	"github.com/go-chi/chi"
)

func details(w http.ResponseWriter, r *http.Request) {

	organizationID := chi.URLParam(r, "organization_id")
	id, err := strconv.Atoi(organizationID)

	if err != nil {
		return
	}

	organization := &model.Organization{}
	organization.ID = uint(id)

	err = model.DB.Model(&model.Organization{}).First(&organization).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusOK, organization)
}
