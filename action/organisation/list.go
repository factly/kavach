package organisation

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/renderx"
	"gorm.io/gorm"
)

// list - Get all organisations
// @Summary Show all organisations
// @Description Get all organisations
// @Tags Organisation
// @ID get-all-my-organisations
// @Produce  json
// @Param X-User header string true "User ID"
// @Success 200 {array} []orgWithRole
// @Router /organisations/my [get]
func list(w http.ResponseWriter, r *http.Request) {
	organisationUser := make([]model.OrganisationUser, 0)

	userID, err := strconv.Atoi(r.Header.Get("X-User"))

	if err != nil {
		renderx.JSON(w, http.StatusBadRequest, nil)
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)

	defer cancel()

	model.DB.Session(&gorm.Session{Context: ctx}).Model(&model.OrganisationUser{}).Where(&model.OrganisationUser{
		UserID: uint(userID),
	}).Preload("Organisation").Preload("Organisation.Medium").Find(&organisationUser)

	orgIDs := make([]uint, 0)
	for _, ou := range organisationUser {
		orgIDs = append(orgIDs, ou.OrganisationID)
	}

	applicationList := make([]model.Application, 0)
	model.DB.Session(&gorm.Session{Context: ctx}).Model(&model.Application{}).Where("organisation_id IN (?)", orgIDs).Find(&applicationList)

	appMap := make(map[uint][]model.Application)

	for _, app := range applicationList {
		if _, found := appMap[app.OrganisationID]; !found {
			appMap[app.OrganisationID] = make([]model.Application, 0)
		}
		appMap[app.OrganisationID] = append(appMap[app.OrganisationID], app)
	}

	result := make([]orgWithRole, 0)

	for _, each := range organisationUser {
		if each.Organisation != nil {
			eachOrg := orgWithRole{}
			eachOrg.Organisation = *each.Organisation
			eachOrg.Permission = each
			eachOrg.Applications = appMap[each.OrganisationID]

			eachOrg.Permission.Organisation = nil

			result = append(result, eachOrg)
		}

	}

	renderx.JSON(w, http.StatusOK, result)
}
