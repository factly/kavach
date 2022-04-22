package token

import (
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

func list(w http.ResponseWriter, r *http.Request) {
	userID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
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

	result := make([]model.SpaceToken, 0)

	err = model.DB.Model(&model.SpaceToken{}).Where(&model.SpaceToken{
		SpaceID: uint(spaceID),
	}).Preload("Space").Find(&result).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
