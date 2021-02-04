package application

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/keto"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// delete - Delete application by id
// @Summary Delete a application
// @Description Delete application by ID
// @Tags OrganisationApplications
// @ID delete-application-by-id
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param application_id path string true "Application ID"
// @Success 200
// @Router /organisations/{organisation_id}/applications/{application_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {
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

	result := model.Application{}
	result.ID = uint(appID)

	// Check if record exist or not
	err = model.DB.Model(&model.Application{}).Where(&model.Application{
		OrganisationID: uint(oID),
	}).Preload("Users").First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	// Check if the user is owner of organisation
	permission := &model.OrganisationUser{}
	err = model.DB.Model(&model.OrganisationUser{}).Where(&model.OrganisationUser{
		OrganisationID: uint(oID),
		UserID:         uint(uID),
		Role:           "owner",
	}).First(permission).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	tx := model.DB.Begin()

	// delete application users
	err = tx.Model(&result).Association("Users").Delete(result.Users)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	policyID := fmt.Sprint("id:org:", organisationID, ":app:", result.ID, ":users")
	roleID := fmt.Sprint("roles:org:", organisationID, ":app:", result.ID, ":users")

	// delete application users policy
	err = keto.Delete("/engines/acp/ory/regex/policies/" + policyID)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.NetworkError()))
		return
	}

	// delete application users role
	err = keto.Delete("/engines/acp/ory/regex/roles/" + roleID)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.NetworkError()))
		return
	}

	// delete application
	tx.Delete(&result)

	tx.Commit()

	renderx.JSON(w, http.StatusOK, nil)
}
