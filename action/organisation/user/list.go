package user

import (
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// list return all user in organisation
func list(w http.ResponseWriter, r *http.Request) {
	organisationID := chi.URLParam(r, "organisation_id")
	orgID, err := strconv.Atoi(organisationID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// check the permission of host
	host := &model.OrganisationUser{}
	hostID, _ := strconv.Atoi(r.Header.Get("X-User"))

	err = model.DB.Model(&model.OrganisationUser{}).Where(&model.OrganisationUser{
		OrganisationID: uint(orgID),
		UserID:         uint(hostID),
	}).First(&host).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	users := make([]model.OrganisationUser, 0)

	model.DB.Model(&model.OrganisationUser{}).Where(&model.OrganisationUser{
		OrganisationID: uint(orgID),
	}).Preload("User").Find(&users)

	result := make([]userWithPermission, 0)

	for _, each := range users {
		eachUser := userWithPermission{}
		eachUser.User = *each.User
		eachUser.Permission = each
		eachUser.Permission.User = nil

		result = append(result, eachUser)
	}

	renderx.JSON(w, http.StatusOK, result)
}
