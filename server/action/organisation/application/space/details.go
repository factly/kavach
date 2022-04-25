package space

import (
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// details - Get space by id
// @Summary Show a space by id
// @Description Get space by ID
// @Tags Spaces
// @ID get-organisation-application-space-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param application_id path string true "Application ID"
// @Param application_id path string true "Space ID"
// @Success 200 {object} model.Space
// @Router /organisations/{organisation_id}/applications/{application_id}/spaces/{space_id} [get]
func details(w http.ResponseWriter, r *http.Request) {
	uID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		loggerx.Error(err)
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
	// check if the user is part of space or not
	space := &model.Space{}
	err = model.DB.Model(&model.Space{}).Where(&model.Space{
		Base: model.Base{
			ID: uint(sID),
		},
	}).Preload("Users").Preload("Logo").Preload("FavIcon").Preload("MobileIcon").Preload("Organisation").Preload("Application").Preload("Tokens").
		Find(&space).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	flag := false
	for _, user := range space.Users {
		if user.ID == uint(uID) {
			flag = true
			break
		}
	}

	if !flag {
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	renderx.JSON(w, http.StatusOK, space)
}
