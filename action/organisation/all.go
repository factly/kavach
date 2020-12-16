package organisation

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/renderx"
	"gorm.io/gorm"
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
// @Param q query string false "Query"
// @Success 200 {array} model.Organisation
// @Router /organisations [get]
func all(w http.ResponseWriter, r *http.Request) {
	result := paging{}
	result.Nodes = make([]model.Organisation, 0)

	searchQuery := r.URL.Query().Get("q")

	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)

	defer cancel()

	tx := model.DB.Session(&gorm.Session{Context: ctx}).Model(&model.Organisation{})

	if searchQuery != "" {
		query := fmt.Sprint("%", searchQuery, "%")
		tx.Where("title ILIKE ?", query)
	}

	tx.Count(&result.Total).Preload("Medium").Find(&result.Nodes)

	renderx.JSON(w, http.StatusOK, result)
}
