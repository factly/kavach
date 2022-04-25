package application

import (
	"context"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// details - Get application by id
// @Summary Show a application by id
// @Description Get application by ID
// @Tags OrganisationApplications
// @ID get-organisation-application-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param application_id path string true "Application ID"
// @Success 200 {object} model.Application
// @Router /organisations/{organisation_id}/applications/{application_id} [get]
func details(w http.ResponseWriter, r *http.Request) {
	applicationID := chi.URLParam(r, "application_id")
	appID, err := strconv.Atoi(applicationID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	uID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// check if the user is part of application or not
	tx := model.DB.WithContext(context.WithValue(r.Context(), userContext, uID)).Begin()
	app := &model.Application{}
	err = tx.Model(&model.Application{}).Where(&model.Application{
		Base: model.Base{
			ID: uint(appID),
		},
	}).Preload("Users").Preload("Spaces").Preload("Tokens").Preload("Medium").Find(&app).Error

	if err != nil {
		loggerx.Error(err)
		tx.Rollback()
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	flag := false
	for _, user := range app.Users {
		if user.ID == uint(uID) {
			flag = true
			break
		}
	}

	if !flag {
		tx.Rollback()
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	renderx.JSON(w, http.StatusOK, app)
}
