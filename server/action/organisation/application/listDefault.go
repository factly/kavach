package application

import (
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/slugx"
	"github.com/go-chi/chi"
	"github.com/spf13/viper"
)

// list - Get all default applications
// @Summary Show all default applications
// @Description Get all default applications
// @Tags DefaultApplications
// @ID get-all-default-applications
// @Produce  json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Success 200 {array} []model.Application
// @Router /organisations/{organisation_id}/applications/default [get]
func listDefault(w http.ResponseWriter, r *http.Request) {
	organisationID := chi.URLParam(r, "organisation_id")
	oID, err := strconv.Atoi(organisationID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	uID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	err = util.CheckOwner(uint(uID), uint(oID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	org := model.Organisation{}
	err = model.DB.Model(&model.Organisation{}).Where(&model.Organisation{
		Slug: slugx.Make(viper.GetString("DEFAULT_ORGANISATION_NAME")),
	}).First(&org).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	apps := []model.Application{}
	err = model.DB.Model(&model.Application{}).Where(&model.Application{
		IsDefault: true,
	}).Find(&apps).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	renderx.JSON(w, http.StatusOK, apps)
}
