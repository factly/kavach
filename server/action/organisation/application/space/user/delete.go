package user

import (
	"context"
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

func delete(w http.ResponseWriter, r *http.Request) {
	adminID, err := strconv.Atoi(r.Header.Get("X-User"))
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

	uID := chi.URLParam(r, "user_id")
	userID, err := strconv.Atoi(uID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}
	// check if the logged in user is admin or not
	err = util.CheckOwner(uint(adminID), uint(orgID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.CannotSaveChanges()))
		return
	}

	space := &model.Space{}
	//check if user is part of space or not
	err = model.DB.Model(&model.Space{}).Where(&model.Space{
		Base: model.Base{
			ID: uint(spaceID),
		},
	}).Preload("Users").Find(&space).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	newUsers := make([]model.User, 0)
	flag := false

	for _, user := range space.Users {
		if user.ID == uint(userID) {
			flag = true
		} else {
			newUsers = append(newUsers, user)
		}
	}

	if !flag {
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	var count int64
	err = model.DB.Model(&model.Space{}).Where(&model.Space{
		Base: model.Base{
			CreatedByID: uint(userID),
		},
	}).Count(&count).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	if count != 0 {
		loggerx.Error(errors.New("user who created space cannot be deleted"))
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return 
	}
	if err = model.DB.WithContext(context.WithValue(r.Context(), userContext, adminID)).Model(&space).Association("Users").Replace(&newUsers); err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusOK, nil)
}
