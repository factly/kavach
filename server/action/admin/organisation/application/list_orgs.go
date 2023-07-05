package application

import (
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

type response struct {
	Nodes []model.Organisation `json:"nodes"`
	Total int64                `json:"total"`
}

func ListOrgs(w http.ResponseWriter, r *http.Request) {
	aId := chi.URLParam(r, "app_id")
	appID, err := strconv.Atoi(aId)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}
	app := &model.Application{}
	app.ID = uint(appID)
	err = model.DB.Model(&model.Application{}).Preload("Organisations").Find(app).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	res := &response{}
	res.Nodes = app.Organisations
	res.Total = int64(len(res.Nodes))

	renderx.JSON(w, http.StatusOK, res)
	return
}
