package util

import (
	"net/http"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

func getApplication(w http.ResponseWriter, r *http.Request) {
	applicationSlug := chi.URLParam(r, "application_slug")

	app := model.Application{}

	err := model.DB.Model(&model.Application{}).Where(&model.Application{
		Slug:      applicationSlug,
		IsDefault: true,
	}).First(&app).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	response := map[string]interface{}{
		"application_id": app.ID,
	}

	renderx.JSON(w, http.StatusOK, response)
}
