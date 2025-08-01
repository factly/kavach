package user

import (
	"net/http"
	"time"

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
	sort := r.URL.Query().Get("sort")
	from := r.URL.Query().Get("from")
	to := r.URL.Query().Get("to")
	isReport := r.URL.Query().Get("is_report")
	res := &response{}

	if sort != "asc" {
		sort = "desc"
	}

	if len(userIDs) == 0 {
		qs := "%" + searchQuery + "%"
		tx := model.DB.Model(&model.User{}).Preload("Organisations").Where("display_name ILIKE ? OR email ILIKE ?", qs, qs).Order("created_at " + sort)

		if isReport == "true" {
			var fromTime, toTime time.Time
			var err error
			if from == "" || to == "" {
				toTime = time.Now()
				fromTime = toTime.AddDate(0, 0, -30)
			} else {
				fromTime, err = time.Parse("2006-01-02", from)
				if err != nil {
					loggerx.Error(err)
					errorx.Render(w, errorx.Parser(errorx.InvalidID()))
					return
				}
				toTime, err = time.Parse("2006-01-02", to)
				if err != nil {
					loggerx.Error(err)
					errorx.Render(w, errorx.Parser(errorx.InvalidID()))
					return
				}
				toTime = toTime.Add(23*time.Hour + 59*time.Minute + 59*time.Second)
			}

			if toTime.Sub(fromTime).Hours() > 24*30*3 {
				errorx.Render(w, errorx.Parser(errorx.GetMessage("range cannot be more than 3 months", http.StatusUnprocessableEntity)))
				return
			}

			// Apply date range filter
			tx = tx.Where("created_at BETWEEN ? AND ?", fromTime, toTime)

			err = tx.Find(&res.Nodes).Error
			if err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.DBError()))
				return
			}
			res.Total = int64(len(res.Nodes))
		} else {
			offset, limit := paginationx.Parse(r.URL.Query())
			err := tx.Count(&res.Total).Offset(offset).Limit(limit).Find(&res.Nodes).Error
			if err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.DBError()))
				return
			}
		}
	} else {
		err := model.DB.Model(&model.User{}).Preload("Organisations").Where(userIDs).Find(&res.Nodes).Error
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
		res.Total = int64(len(res.Nodes))

	}

	renderx.JSON(w, http.StatusOK, res)
}
