package analytics

import (
	"net/http"
	"time"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

type Data struct {
	Name  string `json:"name"`
	Count int64  `json:"count"`
}

type response struct {
	TotalUsers int64  `json:"total_users"`
	Analytics  []Data `json:"analytics"`
}

type rawdata struct {
	Name  time.Time
	Count int64
}

func details(w http.ResponseWriter, r *http.Request) {
	result := &response{}
	from := r.URL.Query().Get("from")
	to := r.URL.Query().Get("to")

	// Get total users
	err := model.DB.Model(&model.User{}).Count(&result.TotalUsers).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	if from == "" || to == "" {
		renderx.JSON(w, http.StatusOK, result)
		return
	}

	fromTime, err := time.Parse("2006-01-02", from)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}
	toTime, err := time.Parse("2006-01-02", to)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}
	toTime = toTime.Add(23*time.Hour + 59*time.Minute + 59*time.Second)

	if toTime.Sub(fromTime).Hours() > 24*30*12 {
		errorx.Render(w, errorx.Parser(errorx.GetMessage("range cannot be more than 12 months", http.StatusUnprocessableEntity)))
		return
	}

	var format, level string

	if toTime.Sub(fromTime).Hours() <= 24*30 {
		format = "02/01/2006"
		level = "day"
	} else {
		format = "Jan 2006"
		level = "month"
	}

	tx := model.DB.Model(&model.User{}).Select("count(id) as count, date_trunc('"+level+"', created_at) as name").Where("created_at BETWEEN ? AND ?", fromTime, toTime).Group("name").Order("name")

	rawAnalytics := make([]rawdata, 0)
	err = tx.Scan(&rawAnalytics).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	for _, raw := range rawAnalytics {
		result.Analytics = append(result.Analytics, Data{
			Name:  raw.Name.Format(format),
			Count: raw.Count,
		})
	}

	renderx.JSON(w, http.StatusOK, result)
}
