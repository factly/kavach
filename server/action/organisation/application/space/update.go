package space

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

// create - Create organisation application
// @Summary Create organisation application
// @Description Create organisation application
// @Tags OrganisationApplications
// @ID add-organisation-application
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param Application body model.SpaceRole true "Application Object"
// @Success 201 {object} model.Application
// @Failure 400 {array} string
// @Router /organisations/{organisation_id}/applications/{application_id}/spaces/{space_id} [post]
func update(w http.ResponseWriter, r *http.Request) {
	uID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	organisationID := chi.URLParam(r, "organisation_id")
	oID, err := strconv.Atoi(organisationID)
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
	space := &model.Space{}
	space.ID = uint(sID)
	err = json.NewDecoder(r.Body).Decode(space)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}
	space.UpdatedByID = uint(uID)
	validationError := validationx.Check(space)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	// check if the user is owner or  not
	err = util.CheckOwner(uint(uID), uint(oID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}
	tx := model.DB.Begin()
	// Check if record exist or not
	var count int64
	err = tx.Model(&model.Space{}).Where(&model.Space{
		Base: model.Base{
			ID: space.ID,
		},
	}).Count(&count).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	if count > 1 {
		tx.Rollback()
		loggerx.Error(errors.New("space already exists"))
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	updateMap := map[string]interface{}{
		"name":        space.Name,
		"slug":        space.Slug,
		"description": space.Description,
		"meta_fields":    space.MetaFields,
	}
	updatedSpace := new(model.Space)
	err = tx.Model(&model.Space{}).Where("id = ?", space.ID).Updates(updateMap).First(updatedSpace).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	tx.Commit()
	renderx.JSON(w, http.StatusOK, updatedSpace)
}
