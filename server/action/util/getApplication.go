package util

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/user"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

func getApplication(w http.ResponseWriter, r *http.Request) {
	userID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	applicationSlug := chi.URLParam(r, "application_slug")

	app := model.Application{}

	err = model.DB.Model(&model.Application{}).Where(&model.Application{
		Slug:      applicationSlug,
		IsDefault: true,
	}).First(&app).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	// Verify whether the user is part of application or not
	objectID := fmt.Sprintf("org:%d:app:%d", app.OrganisationID, app.ID)
	isAuthorised, err := user.IsUserAuthorised(
		"applications",
		objectID,
		fmt.Sprintf("%d", userID),
	)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	if !isAuthorised {
		loggerx.Error(errors.New("user is not part of the application"))
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	response := map[string]interface{}{
		"application_id": app.ID,
	}

	renderx.JSON(w, http.StatusOK, response)
}
