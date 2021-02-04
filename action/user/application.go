package user

import (
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

type paging struct {
	Nodes []model.User `json:"nodes"`
	Total int          `json:"total"`
}

func list(w http.ResponseWriter, r *http.Request) {
	userID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	orgID, err := strconv.Atoi(r.Header.Get("X-Organisation"))
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	appSlug := r.URL.Query().Get("application")

	// Check if user is part of organisation
	permission := &model.OrganisationUser{}
	err = model.DB.Model(&model.OrganisationUser{}).Where(&model.OrganisationUser{
		OrganisationID: uint(orgID),
		UserID:         uint(userID),
	}).First(permission).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	app := &model.Application{}

	model.DB.Model(&model.Application{}).Where(model.Application{
		Slug:           appSlug,
		OrganisationID: uint(orgID),
	}).Preload("Users").Preload("Users.Medium").First(&app)

	result := paging{}

	result.Nodes = app.Users
	result.Total = len(app.Users)

	renderx.JSON(w, http.StatusOK, result)
}
