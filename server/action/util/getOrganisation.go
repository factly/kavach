package util

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/user"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

func getOrganisation(w http.ResponseWriter, r *http.Request) {
	userID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}
	spaceID := chi.URLParam(r, "space_id")
	sID, err := strconv.Atoi(spaceID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
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
	// VERIFY WHETHER THE USER IS PART OF space OR NOT
	objectID := fmt.Sprintf("org:%d:app:%d:space:%d", space.OrganisationID, space.ApplicationID, space.ID)
	isAuthorised, err := user.IsUserAuthorised(
		"spaces",
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

	response := map[string]interface{}{
		"organisation_id": space.OrganisationID,
	}
	renderx.JSON(w, http.StatusOK, response)
}
