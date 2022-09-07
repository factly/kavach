package user

import (
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

type Paging struct {
	Nodes []model.User `json:"nodes"`
	Total int          `json:"total"`
}

// list - Get list of users for application
// @Summary Get list of users for application
// @Description Get list of users for application
// @Tags User
// @ID get-user-list
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Organisation header string true "Organisation ID"
// @Param application query string true "Application Slug"
// @Success 200 {object} paging
// @Router /users/application [get]
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
	if appSlug == "" {
		errorx.Render(w, errorx.Parser(errorx.GetMessage("invalid application query param", http.StatusBadRequest)))
		return
	}

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

	result := Paging{}

	result.Nodes = app.Users
	result.Total = len(app.Users)

	renderx.JSON(w, http.StatusOK, result)
}
