package space

import (
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// create - Create space application
// @Summary Create space application
// @Description Create space application
// @Tags spaceApplications
// @ID add-space-application
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param space_id path string true "space ID"
// @Param Application body application true "Application Object"
// @Success 201 {object} model.Application
// @Failure 400 {array} string
// @Router /spaces/{space_id}/applications [post]
func delete(w http.ResponseWriter, r *http.Request) {
	spaceID := chi.URLParam(r, "space_id")
	sID, err := strconv.Atoi(spaceID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}
	space := &model.Space{}
	space.ID = uint(sID)
	//check if record exists or not
	err = model.DB.Model(&model.Space{}).First(&space).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	organisationID := chi.URLParam(r, "organisation_id")
	orgID, err := strconv.Atoi(organisationID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// check the permission of host
	hostID, err := strconv.Atoi(r.Header.Get("X-User"))

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	err = util.CheckOwner(uint(hostID), uint(orgID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	err = model.DB.Model(&model.Space{}).Where("id = ?", space.ID).Delete(space).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	renderx.JSON(w, http.StatusOK, nil)
}
