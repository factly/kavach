package user

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
)

type spaceUser struct {
	UserID int `json:"user_id" validate:"required"`
}

// create - Create space user
// @Summary Create space user
// @Description Create space user
// @Tags SpaceUser
// @ID add-space-user
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param application_id path string true "Application ID"
// @Param organisation_id path string true "Organisation ID"
// @Param Application User body applicationUsers true "User ID Object"
// @Success 201
// @Failure 400 {array} string
// @Router /organisations/{organisation_id}/applications/{application_id}/space/{space_id}/users [post]
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

	sID := chi.URLParam(r, "space_id")
	spaceID, err := strconv.Atoi(sID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	if err := util.CheckOwner(uint(userID), uint(orgID)); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	var spaceUser spaceUser
	if err := json.NewDecoder(r.Body).Decode(&spaceUser); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(spaceUser)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}
	// check if the user is part of space or not
	tx := model.DB.Begin()
	space := &model.Space{}
	err = tx.Model(&model.Space{}).Where(&model.Space{
		Base: model.Base{
			ID: uint(spaceID),
		},
	}).Preload("Users").Find(&space).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	flag := false
	for _, user := range space.Users {
		if user.ID == uint(userID) {
			flag = true
			break
		}
	}

	if !flag {
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	users := make([]model.User, 0)
	// append user to space_user association
	users = append(space.Users, model.User{Base: model.Base{ID: uint(spaceUser.UserID)}})
	space.Users = users
	fmt.Println("this is users", users)
	if err = tx.Model(&space).Association("Users").Replace(&users); err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Commit()
	renderx.JSON(w, http.StatusCreated, users)
}
