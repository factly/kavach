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

// update - Update organisation by id
// @Summary Update a organisation by id
// @Description Update organisation by ID
// @Tags Organisation
// @ID update-organisation-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param Organisation body model.Organisation false "Organisation Object"
// @Success 200 {object} orgWithRole
// @Router /organisations/{organisation_id} [put]
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

	// check the permission of host
	permission := &model.OrganisationUser{}

	err = model.DB.Model(&model.OrganisationUser{}).Where(&model.OrganisationUser{
		OrganisationID: uint(orgID),
		UserID:         uint(hostID),
		Role:           "owner",
	}).First(permission).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	tx := model.DB.WithContext(context.WithValue(r.Context(), userkey, hostID)).Begin()

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
	err = tx.Model(&organisation).Updates(model.Organisation{
		Title:            req.Title,
		Slug:             req.Slug,
		Description:      req.Description,
		FeaturedMediumID: mediumID,
	}).Preload("Medium").First(&organisation).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	result := &orgWithRole{}
	result.Organisation = *organisation
	result.Permission = *permission

	tx.Commit()

	renderx.JSON(w, http.StatusOK, result)
}
