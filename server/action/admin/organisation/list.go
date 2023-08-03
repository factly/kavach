package organisation

import (
	"net/http"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
)

type response struct {
	Nodes []model.Organisation `json:"nodes"`
	Total int64                `json:"total"`
}

func list(w http.ResponseWriter, r *http.Request) {

	orgIDs := r.URL.Query()["id"]
	// if orgIDs is empty, then return all organisations
	// else return organisations with given ids
	res := &response{}
	if len(orgIDs) == 0 {
		offset, limit := paginationx.Parse(r.URL.Query())
		err := model.DB.Model(&model.Organisation{}).Count(&res.Total).Offset(offset).Limit(limit).Find(&res.Nodes).Error
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	} else {
		err := model.DB.Model(&model.Organisation{}).Where(orgIDs).Find(&res.Nodes).Error
		res.Total = int64(len(res.Nodes))
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	renderx.JSON(w, http.StatusOK, res)
}
