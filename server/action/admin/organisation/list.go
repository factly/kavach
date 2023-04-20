package organisation

import (
	"net/http"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
)

func list(w http.ResponseWriter, r *http.Request) {

	orgIDs := r.URL.Query()["id"]

	offset, limit := paginationx.Parse(r.URL.Query())

	if len(orgIDs) > 0 {
		offset = 0
		limit = len(orgIDs)
	}

	res := make([]model.Organisation, 0)

	err := model.DB.Model(&model.Organisation{}).Where(orgIDs).Offset(offset).Limit(limit).Find(&res).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusOK, res)
}
