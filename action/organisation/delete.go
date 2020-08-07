package organisation

import (
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/util"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

func delete(w http.ResponseWriter, r *http.Request) {
	organisationID := chi.URLParam(r, "organisation_id")
	orgID, err := strconv.Atoi(organisationID)

	if err != nil {
		util.LogError(r, err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	organisation := &model.Organisation{}
	organisation.ID = uint(orgID)

	// check record exists or not
	err = model.DB.First(&organisation).Error
	if err != nil {
		util.LogError(r, err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	// check the permission of host
	hostID, err := strconv.Atoi(r.Header.Get("X-User"))

	if err != nil {
		util.LogError(r, err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	err = util.CheckOwner(uint(hostID), uint(orgID))

	if err != nil {
		util.LogError(r, err)
		errorx.Render(w, errorx.Parser(errorx.CannotSaveChanges()))
		return
	}

	// Delete all organisation_users associations
	orgUsers := model.OrganisationUser{
		OrganisationID: uint(orgID),
	}

	model.DB.Where(&orgUsers).Delete(&orgUsers)

	// delete
	model.DB.Delete(&organisation)

	renderx.JSON(w, http.StatusOK, nil)
}
