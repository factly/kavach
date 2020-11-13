package organisation

import (
	"net/http"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/renderx"
)

type paging struct {
	Nodes []model.Organisation `json:"nodes"`
	Total int64                `json:"total"`
}

// all - Get all organisations
// @Summary Show all organisations
// @Description Get all organisations
// @Tags Organisation
// @ID get-all-organisations
// @Produce  json
// @Param X-User header string true "User ID"
// @Success 200 {array} model.Organisation
// @Router /organisations [get]
func all(w http.ResponseWriter, r *http.Request) {
	result := paging{}
	result.Nodes = make([]model.Organisation, 0)

	model.DB.Model(&model.Organisation{}).Count(&result.Total).Preload("Medium").Find(&result.Nodes)

	renderx.JSON(w, http.StatusOK, result)
}
