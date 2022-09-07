package token

import (
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

	tID := chi.URLParam(r, "token_id")
	tokenID, err := strconv.Atoi(tID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}
	// check if the logged in user is admin or not
	err = util.CheckOwner(uint(userID), uint(orgID))
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

	flag := false

	for _, user := range space.Users {
		if user.ID == uint(userID) {
			flag = true
		}
	}

	if !flag {
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	// check whether the token exists or not
	var token model.SpaceToken
	err = model.DB.Where(&model.SpaceToken{
		Base: model.Base{
			ID: uint(tokenID),
		},
	}).First(&token).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	//deleting the token
	err = model.DB.Delete(&token).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusOK, nil)
}
