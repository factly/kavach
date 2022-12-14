package token

import (
	"encoding/json"
	"errors"
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

//create - Create token for an organisation using organisation_id
// @Summary Create token for an organisation using organisation_id
// @Description Create token for an organisation using organisation_id
// @Tags OrganisationTokens
// @ID create-organisation-token
// @Produce  json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param OrganisationTokenBody body model.OrganisationToken true "Organisation Token Body"
// @Success 200 {object} model.OrganisationToken
// @Router /organisations/{organisation_id}/tokens [post]
func create(w http.ResponseWriter, r *http.Request) {
	organisationID := chi.URLParam(r, "organisation_id")
	oID, err := strconv.Atoi(organisationID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	uID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	organisationToken := &model.OrganisationToken{}
	err = json.NewDecoder(r.Body).Decode(&organisationToken)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(organisationToken)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	err = util.CheckOwner(uint(uID), uint(oID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// get user details using user_id
	var user model.User
	err = model.DB.Model(&model.User{}).Where(&model.User{
		Base: model.Base{
			ID: uint(uID),
		},
	},
	).First(&user).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	// getting organisation slug
	orgMap := make(map[string]interface{})
	err = model.DB.Model(&model.Organisation{}).Where(&model.Organisation{
		Base: model.Base{
			ID: uint(oID),
		},
	},
	).Pluck("slug", &orgMap).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	organisationToken.OrganisationID = uint(oID)
	organisationToken.Token = util.GenerateSecretToken()
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	organisationToken.CreatedByID = uint(uID)
	err = model.DB.Model(&model.OrganisationToken{}).Create(&organisationToken).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	response := map[string]interface{}{
		"token": organisationToken.Token,
	}
	renderx.JSON(w, http.StatusOK, response)
}
