package util

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

func getSpaceDetailsUsingToken(w http.ResponseWriter, r *http.Request) {
	spaceID := chi.URLParam(r, "space_id")
	sID, err := strconv.Atoi(spaceID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	token := r.Header.Get("X-Space-Token")
	if token == "" {
		loggerx.Error(errors.New("token was not found"))
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	spaceToken := model.SpaceToken{}
	err = model.DB.Model(&model.SpaceToken{}).Where(&model.SpaceToken{
		Token: token,
	}).Find(&spaceToken).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	if spaceToken.SpaceID != uint(sID) {
		loggerx.Error(errors.New("the token is invalid"))
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	space := model.Space{}
	err = model.DB.Model(&model.Space{}).Where(&model.Space{
		Base: model.Base{
			ID: uint(sID),
		},
	}).First(&space).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	renderx.JSON(w, http.StatusOK, space)
}
