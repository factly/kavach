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

// list - Get all organisations users
// @Summary Show all organisations users
// @Description Get all organisations users
// @Tags OrganisationUser
// @ID get-all-organisations-users
// @Produce  json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Success 200 {array} []userWithPermission
// @Router /organisations/{organisation_id}/users [get]
func list(w http.ResponseWriter, r *http.Request) {
	organisationID := chi.URLParam(r, "organisation_id")
	orgID, err := strconv.Atoi(organisationID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}
	role := r.URL.Query().Get("role")
	// check the permission of host
	host := &model.OrganisationUser{}
	hostID, _ := strconv.Atoi(r.Header.Get("X-User"))

	err = model.DB.Model(&model.OrganisationUser{}).Where(&model.OrganisationUser{
		OrganisationID: uint(orgID),
		UserID:         uint(hostID),
	},
	).First(&host).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	users := make([]model.OrganisationUser, 0)
	if role == "owner" || role == "member" {
		model.DB.Model(&model.OrganisationUser{}).Where(&model.OrganisationUser{
			OrganisationID: uint(orgID),
			Role:           role,
		}).Preload("User").Preload("User.Medium").Find(&users)
	} else {
		model.DB.Model(&model.OrganisationUser{}).Where(&model.OrganisationUser{
			OrganisationID: uint(orgID)}).Preload("User").Preload("User.Medium").Find(&users)
	}

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
