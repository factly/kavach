package user

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	keto "github.com/factly/kavach-server/util/keto/relationTuple"
	"github.com/factly/kavach-server/util/user"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

func list(w http.ResponseWriter, r *http.Request) {
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

	// VERIFY WHETHER THE USER IS PART OF space OR NOT
	objectID := fmt.Sprintf("org:%d:app:%d:space:%d", orgID, appID, spaceID)
	isAuthorised, err := user.IsUserAuthorised(
		namespace,
		objectID,
		fmt.Sprintf("%d", userID),
	)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	if !isAuthorised {
		loggerx.Error(errors.New("user is not part of the space"))
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	userIDs, err := keto.ListSubjectsByObjectID(namespace, "", objectID)
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

	renderx.JSON(w, http.StatusOK, users)
}
