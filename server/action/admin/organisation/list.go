package organisation

import (
	"log"
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
		err := model.DB.Model(&model.Organisation{}).Count(&res.Total).Find(&res.Nodes).Error
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
		offset, limit := paginationx.Parse(r.URL.Query())
		res.Total = int64(len(orgIDs))
		err := model.DB.Model(&model.Organisation{}).Where("id IN (?)", orgIDs).Offset(offset).Limit(limit).Find(&res.Nodes).Error
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	log.Println("go to renderx.JSON")
	renderx.JSON(w, http.StatusOK, res)
	return
}
