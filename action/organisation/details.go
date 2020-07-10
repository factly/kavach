package organisation

import (
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

func details(w http.ResponseWriter, r *http.Request) {

	organisationID := chi.URLParam(r, "organisation_id")
	id, err := strconv.Atoi(organisationID)

	if err != nil {
		return
	}
	var permission model.OrganisationUser

	userID, _ := strconv.Atoi(r.Header.Get("X-User"))

	model.DB.Model(&model.OrganisationUser{}).Where(&model.OrganisationUser{
		UserID:         uint(userID),
		OrganisationID: uint(id),
	}).First(&permission)

	organisation := &model.Organisation{}
	organisation.ID = uint(id)

	err = model.DB.Model(&model.Organisation{}).First(&organisation).Error

	if err != nil {
		return
	}

	result := orgWithRole{}

	result.Organisation = *organisation
	result.Permission = permission

	renderx.JSON(w, http.StatusOK, result)
}
