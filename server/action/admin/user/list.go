package user

import (
	"net/http"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
)

type response struct {
	Nodes []model.User `json:"node"`
	Total int64        `json:"total"`
}

func list(w http.ResponseWriter, r *http.Request) {

	userIDs := r.URL.Query()["id"]
	res := &response{}

	if len(userIDs) == 0 {
		offset, limit := paginationx.Parse(r.URL.Query())
		err := model.DB.Model(&model.User{}).Count(&res.Total).Offset(offset).Limit(limit).Preload("Organisations").Find(&res.Nodes).Error
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	} else {
		err := model.DB.Model(&model.User{}).Where(userIDs).Preload("Organisations").Find(&res.Nodes).Error
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
		res.Total = int64(len(res.Nodes))

	}

	renderx.JSON(w, http.StatusOK, res)
	return
}
