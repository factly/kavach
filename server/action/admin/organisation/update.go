package organisation

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

func update(w http.ResponseWriter, r *http.Request) {
	req := organisation{}
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	organisationID := chi.URLParam(r, "organisation_id")
	orgID, err := strconv.Atoi(organisationID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	hostID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	organisation := &model.Organisation{}
	organisation.ID = uint(orgID)

	// check record exists or not
	err = model.DB.First(&organisation).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	tx := model.DB.WithContext(context.WithValue(r.Context(), userContext, hostID)).Begin()

	mediumID := &req.FeaturedMediumID
	organisation.FeaturedMediumID = &req.FeaturedMediumID
	if req.FeaturedMediumID == 0 {
		err = tx.Model(&organisation).Updates(map[string]interface{}{"featured_medium_id": nil}).First(&organisation).Error
		mediumID = nil
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	// update
	updateMap := map[string]interface{}{
		"updated_by_id":      uint(hostID),
		"title":              req.Title,
		"slug":               req.Slug,
		"description":        req.Description,
		"featured_medium_id": mediumID,
		"is_individual":      req.IsIndividual,
	}

	err = tx.Model(&organisation).Updates(&updateMap).Preload("Medium").First(&organisation).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	// fetching permissions of the user
	permission := &model.OrganisationUser{}
	err = tx.Model(&model.OrganisationUser{}).Where(&model.OrganisationUser{
		OrganisationID: uint(orgID),
	}).First(permission).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}
	var result model.Organisation
	if organisation != nil {
		result = *organisation
	}

	result.OrganisationUsers = []model.OrganisationUser{*permission}

	tx.Commit()

	renderx.JSON(w, http.StatusOK, result)
}
