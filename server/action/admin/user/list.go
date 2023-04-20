package user

import (
	"net/http"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
)

func list(w http.ResponseWriter, r *http.Request) {

	userIDs := r.URL.Query()["id"]

	offset, limit := paginationx.Parse(r.URL.Query())

	if len(userIDs) > 0 {
		offset = 0
		limit = len(userIDs)
	}

	result := make([]model.User, 0)

	err := model.DB.Model(&model.User{}).Preload("Organisations").Where(userIDs).Offset(offset).Limit(limit).Find(&result).Error
	if err != nil {

		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
