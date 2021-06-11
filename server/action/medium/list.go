package medium

import (
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
)

// list response
type paging struct {
	Total int64          `json:"total"`
	Nodes []model.Medium `json:"nodes"`
}

// list - Get all media
// @Summary Show all media
// @Description Get all media
// @Tags Medium
// @ID get-all-media
// @Produce  json
// @Param X-User header string true "User ID"
// @Param sort query string false "Sort"
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Success 200 {array} paging
// @Router /media [get]
func list(w http.ResponseWriter, r *http.Request) {
	userID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		renderx.JSON(w, http.StatusBadRequest, nil)
		return
	}

	sort := r.URL.Query().Get("sort")

	result := paging{}
	result.Nodes = make([]model.Medium, 0)

	offset, limit := paginationx.Parse(r.URL.Query())
	if sort != "asc" {
		sort = "desc"
	}

	err = model.DB.Model(&model.Medium{}).Where(&model.Medium{
		UserID: uint(userID),
	}).Order("created_at " + sort).Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	for i := range result.Nodes {
		addProxyURL(&result.Nodes[i])
	}

	renderx.JSON(w, http.StatusOK, result)
}
