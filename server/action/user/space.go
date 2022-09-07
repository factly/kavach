package user

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	keto "github.com/factly/kavach-server/util/keto/relationTuple"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

func listSpaceUsers(w http.ResponseWriter, r *http.Request) {
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

	objectID := fmt.Sprintf("org:%d:app:%d:space:%d", space.OrganisationID, space.ApplicationID, sID)
	userIDs, err := keto.ListSubjectsByObjectID("spaces", "", objectID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	users := []model.User{}
	for _, userID := range userIDs {
		uID, err := strconv.Atoi(userID)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DecodeError()))
			return
		}

		var userModel model.User
		err = model.DB.Model(&model.User{}).Where(&model.User{
			Base: model.Base{
				ID: uint(uID),
			},
		}).Preload("Medium").First(&userModel).Error
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
		users = append(users, userModel)
	}

	result := Paging{}
	result.Nodes = users
	result.Total = len(users)
	renderx.JSON(w, http.StatusOK, result)
}
