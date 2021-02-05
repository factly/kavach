package user

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
)

type applicationUsers struct {
	UserID int `json:"user_id" validate:"required"`
}

// create - Create application user
// @Summary Create application user
// @Description Create application user
// @Tags ApplicationUser
// @ID add-application-user
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param application_id path string true "Application ID"
// @Param organisation_id path string true "Organisation ID"
// @Param Application User body applicationUsers true "User ID Object"
// @Success 201
// @Failure 400 {array} string
// @Router /organisations/{organisation_id}/applications/{application_id}/users [post]
func create(w http.ResponseWriter, r *http.Request) {
	userID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	organisationID := chi.URLParam(r, "organisation_id")
	orgID, err := strconv.Atoi(organisationID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	applicationID := chi.URLParam(r, "application_id")
	appID, err := strconv.Atoi(applicationID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	appUsers := &applicationUsers{}

	err = json.NewDecoder(r.Body).Decode(&appUsers)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(appUsers)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	userOrg := &model.OrganisationUser{}

	model.DB.Model(&model.OrganisationUser{}).Where(&model.OrganisationUser{OrganisationID: uint(orgID), UserID: uint(userID)}).
		Preload("Organisation").
		Preload("User").
		First(&userOrg)

	if userOrg.Role != "owner" {
		renderx.JSON(w, http.StatusUnauthorized, nil)
		return
	}

	user := &model.OrganisationUser{}
	app := &model.Application{}
	app.ID = uint(appID)

	tx := model.DB.WithContext(context.WithValue(r.Context(), userContext, userID)).Begin()

	// Check if application exist
	err = tx.Model(&model.Application{}).Preload("Users").First(&app).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	// Check if user belongs to organisation
	err = tx.Model(&model.OrganisationUser{}).Where("user_id IN (?) AND organisation_id IN (?)", appUsers.UserID, uint(orgID)).Preload("User").First(&user).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.GetMessage("user does not belong to organisation", http.StatusUnprocessableEntity)))
		return
	}

	users := make([]model.User, 0)

	// append user to application_user association
	users = append(app.Users, *user.User)
	app.Users = users
	if err = tx.Model(&app).Association("Users").Replace(&users); err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Commit()

	renderx.JSON(w, http.StatusCreated, app)
}
