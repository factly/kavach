package application

import (
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// access - Get access of application based on slug
// @Summary Get access of application based on slug
// @Description Get access of application based on slug
// @Tags OrganisationApplications
// @ID get-access-organisation-application
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param application_slug path string true "Application Slug"
// @Success 200
// @Failure 401
// @Router /organisations/{organisation_id}/applications/{application_slug}/access [get]
func access(w http.ResponseWriter, r *http.Request) {
	appSlug := chi.URLParam(r, "application_slug")
	if appSlug == "" {
		errorx.Render(w, errorx.Parser(errorx.GetMessage("invalid slug", http.StatusBadRequest)))
		return
	}

	uID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	organisationUser := make([]model.OrganisationUser, 0)

	model.DB.Model(&model.OrganisationUser{}).Where(&model.OrganisationUser{
		UserID: uint(uID),
	}).Preload("Organisation").Find(&organisationUser)

	orgIDs := make([]uint, 0)
	for _, ou := range organisationUser {
		orgIDs = append(orgIDs, ou.OrganisationID)
	}

	applicationList := make([]model.Application, 0)
	err = model.DB.Model(&model.Application{}).Where("organisation_id IN (?)", orgIDs).Where(&model.Application{
		Slug: appSlug,
	}).Preload("Users").Find(&applicationList).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	for _, app := range applicationList {
		for _, usr := range app.Users {
			if usr.ID == uint(uID) {
				renderx.JSON(w, http.StatusOK, nil)
				return
			}
		}

	}

	renderx.JSON(w, http.StatusUnauthorized, nil)
}
