package token

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

type paging struct {
	Nodes []applicationToken `json:"nodes"`
	Total int64              `json:"total"`
}

// list - List application tokens
// @Summary List application tokens
// @Description Show a application tokens
// @Tags OrganisationApplicationsTokens
// @ID get-organisation-application-tokens
// @Produce  json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param application_id path string true "Application ID"
// @Success 200 {object} paging
// @Router /organisations/{organisation_id}/applications/{application_id}/tokens [get]
func list(w http.ResponseWriter, r *http.Request) {
	applicationID := chi.URLParam(r, "application_id")
	appID, err := strconv.Atoi(applicationID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	orgnaisationID := chi.URLParam(r, "organisation_id")
	oID, err := strconv.Atoi(orgnaisationID)
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

	// VERIFY WHETHER THE USER IS PART OF Application OR NOT
	isAuthorised, err := user.IsUserAuthorised(
		namespace,
		fmt.Sprintf("org:%d:app:%d", oID, appID),
		fmt.Sprintf("%d", uID),
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

	result := paging{}
	result.Nodes = make([]applicationToken, 0)

	uintAppID := uint(appID)
	model.DB.Model(&model.ApplicationToken{}).Where(&model.ApplicationToken{
		ApplicationID:  uintAppID,
		OrganisationID: uint(oID),
	}).Count(&result.Total).Find(&result.Nodes)

	renderx.JSON(w, http.StatusOK, result)
}
