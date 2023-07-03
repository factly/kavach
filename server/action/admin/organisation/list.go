package organisation

import (
	"net/http"
	"strconv"
	"strings"

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

	orgIDsStr := r.URL.Query()["id"]
	// if orgIDs is empty, then return all organisations
	// else return organisations with given ids
	res := &response{}
	if len(orgIDsStr) == 0 {
		offset, limit := paginationx.Parse(r.URL.Query())
		err := model.DB.Model(&model.Organisation{}).Count(&res.Total).Offset(offset).Limit(limit).Find(&res.Nodes).Error
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	} else {
		orgIDList := strings.Split(orgIDsStr[0], ",")
		var orgIDs []int
		for _, idStr := range orgIDList {
			id, err := strconv.Atoi(idStr)
			if err != nil {
				// Handle error if a string cannot be converted to an integer
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.GetMessage("Invalid OrgID", http.StatusBadRequest)))
				return
			}
			orgIDs = append(orgIDs, id)
		}
		err := model.DB.Model(&model.Organisation{}).Where("id IN (?)", orgIDs).Find(&res.Nodes).Error
		res.Total = int64(len(res.Nodes))
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	renderx.JSON(w, http.StatusOK, res)
	return
}
