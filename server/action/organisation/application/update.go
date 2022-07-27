package application

import (
	"context"
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

// update - Update application by id
// @Summary Update a application by id
// @Description Update application by ID
// @Tags OrganisationApplications
// @ID update-application-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param application_id path string true "Application ID"
// @Param Application body application false "Application Object"
// @Success 200 {object} model.Application
// @Router /organisations/{organisation_id}/applications/{application_id} [put]
func update(w http.ResponseWriter, r *http.Request) {
	uID, err := strconv.Atoi(r.Header.Get("X-User"))
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

	organisationID := chi.URLParam(r, "organisation_id")
	oID, err := strconv.Atoi(organisationID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	app := application{}
	err = json.NewDecoder(r.Body).Decode(&app)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(app)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	result := model.Application{}
	result.ID = uint(appID)
	// Check if record exist or not
	err = model.DB.Model(&model.Application{}).Where(&model.Application{
		Base: model.Base{
			ID: uint(appID),
		},
		OrganisationID: uint(oID),
	}).First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	err = util.CheckOwner(uint(uID), uint(oID))

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	tx := model.DB.WithContext(context.WithValue(r.Context(), userContext, uID)).Begin()

	mediumID := &app.MediumID
	result.MediumID = &app.MediumID
	if app.MediumID == 0 {
		err = tx.Model(&result).Updates(map[string]interface{}{"medium_id": nil}).Error
		mediumID = nil
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	appMap := map[string]interface{}{
		"updated_by_id": uint(uID),
		"name":          app.Name,
		"slug":          app.Slug,
		"description":   app.Description,
		"url":           app.URL,
		"medium_id":     mediumID,
	}
	err = tx.Model(&result).Updates(&appMap).Preload("Medium").Preload("Users").First(&result).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Commit()
	renderx.JSON(w, http.StatusOK, result)
}
