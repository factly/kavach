package token

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

//create - Create token for an space using space_id
// @Summary Create token for an space using space_id
// @Description Create token for an space using space_id
// @Tags SpaceTokens
// @ID create-space-token
// @Produce json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param application_id path string true "Application ID"
// @Param organisation_id path string true "Space ID"
// @Param OrganisationTokenBody body model.OrganisationToken true "Organisation Token Body"
// @Success 200 {object} model.OrganisationToken
// @Router /organisations/{organisation_id}/tokens [post]
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

	spaceToken := &model.SpaceToken{}
	err = json.NewDecoder(r.Body).Decode(&spaceToken)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(spaceToken)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
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

	// get user details using user_id
	var user model.User
	err = model.DB.Model(&model.User{}).Where(&model.User{
		Base: model.Base{
			ID: uint(userID),
		},
	},
	).First(&user).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	// getting space slug
	spaceMap := make(map[string]interface{})
	err = model.DB.Model(&model.Space{}).Where(&model.Space{
		Base: model.Base{
			ID: uint(spaceID),
		},
	},
	).Pluck("slug", &spaceMap).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	uintspaceID := new(uint)
	*uintspaceID = uint(spaceID)
	spaceToken.SpaceID = uintspaceID
	spaceToken.Token = util.GenerateSecretToken(fmt.Sprint(spaceID, ":", spaceMap["slug"].(string), ":", user.KID))
	err = model.DB.Model(&model.SpaceToken{}).Create(&spaceToken).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	response := map[string]interface{}{
		"token": spaceToken.Token,
	}
	renderx.JSON(w, http.StatusOK, response)
}
