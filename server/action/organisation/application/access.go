package application

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	apputil "github.com/factly/kavach-server/util/application"
	"github.com/factly/kavach-server/util/user"
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

	organisationID := chi.URLParam(r, "organisation_id")
	orgID, err := strconv.Atoi(organisationID)

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

	app := new(model.Application)
	err = model.DB.Model(&model.Application{}).Where(&model.Application{
		Slug: appSlug,
	}).First(app).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// the application must be owned by or attached to the organisation, so a
	// stale keto tuple for an application outside it grants nothing
	inOrg, err := apputil.BelongsToOrg(app.ID, uint(orgID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	if !inOrg {
		loggerx.Warning("application does not belong to the organisation")
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// VERIFY WHETHER THE USER IS PART OF Application OR NOT
	isAuthorised, err := user.IsUserAuthorised(
		namespace,
		fmt.Sprintf("org:%d:app:%d", orgID, app.ID),
		fmt.Sprintf("%d", uID),
	)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}
	if !isAuthorised {
		loggerx.Warning("user is not part of the application")
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}
	renderx.JSON(w, http.StatusOK, nil)
}
