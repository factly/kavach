package space

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/factly/kavach-server/model"
	keto "github.com/factly/kavach-server/util/keto/relationTuple"
	"github.com/factly/kavach-server/util/user"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// create - Create organisation application
// @Summary Create organisation application
// @Description Create organisation application
// @Tags OrganisationApplications
// @ID list-space
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Success 201 {object} model.Application
// @Failure 400 {array} string
// @Router /organisations/{organisation_id}/applications/{application_id}/spaces/ [get]
func list(w http.ResponseWriter, r *http.Request) {
	uID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	organisationID := chi.URLParam(r, "organisation_id")
	orgID, err := strconv.Atoi(organisationID)
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

	// VERIFY WHETHER THE USER IS PART OF Application OR NOT
	objectID := fmt.Sprintf("org:%d:app:%d", orgID, appID)
	isAuthorised, err := user.IsUserAuthorised(
		appNamespace,
		objectID,
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

	objects, err := keto.ListObjectsBySubjectID(namespace, "", fmt.Sprintf("%d", uID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	spaceIDs := []int{}
	for _, object := range objects {
		objectID := fmt.Sprintf("org:%d:app:%d:space", orgID, appID)
		if strings.HasPrefix(object, objectID) {
			splittedObject := strings.Split(object, ":")
			spaceID, err := strconv.Atoi(splittedObject[len(splittedObject)-1])
			if err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.DecodeError()))
				return
			}
			spaceIDs = append(spaceIDs, spaceID)
		}
	}

	spaces := make([]model.Space, 0)
	for _, spaceID := range spaceIDs {
		space := &model.Space{}
		err = model.DB.Model(&model.Space{}).Where(&model.Space{
			Base: model.Base{
				ID: uint(spaceID),
			},
		}).Preload("Users").Preload("Organisation").Preload("Application").Preload("Tokens").
			Find(&space).Error
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DecodeError()))
			return
		}
		spaces = append(spaces, *space)
	}

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusOK, spaces)
}
