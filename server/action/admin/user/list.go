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
	Nodes []model.User `json:"nodes"`
	Total int64        `json:"total"`
}

func list(w http.ResponseWriter, r *http.Request) {

	userIDs := r.URL.Query()["id"]
	searchQuery := r.URL.Query().Get("q")
	res := &response{}

	if len(userIDs) == 0 {
		qs := "%" + searchQuery + "%"
		offset, limit := paginationx.Parse(r.URL.Query())
		err := model.DB.Model(&model.User{}).Where("display_name ILIKE ? OR email ILIKE ?", qs, qs).Count(&res.Total).Offset(offset).Limit(limit).Find(&res.Nodes).Error
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	} else {
		err := model.DB.Model(&model.User{}).Where(userIDs).Find(&res.Nodes).Error
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
		res.Total = int64(len(res.Nodes))

	}

	renderx.JSON(w, http.StatusOK, res)
}
