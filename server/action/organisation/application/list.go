package application

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

// list - Get all organisations applications
// @Summary Show all organisations applications
// @Description Get all organisations applications
// @Tags OrganisationApplications
// @ID get-all-organisations-applications
// @Produce  json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Success 200 {array} []model.Application
// @Router /organisations/{organisation_id}/applications [get]
func list(w http.ResponseWriter, r *http.Request) {
	organisationID := chi.URLParam(r, "organisation_id")
	oID, err := strconv.Atoi(organisationID)
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

	// VERIFY WHETHER THE USER IS PART OF Organisation OR NOT
	isAuthorised, err := user.IsUserAuthorised(
		orgNamespace,
		fmt.Sprintf("org:%d", oID),
		fmt.Sprintf("%d", uID),
	)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}
	if !isAuthorised {
		loggerx.Error(errors.New("user is not part of the organisation"))
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	objects, err := keto.ListObjectsBySubjectID(namespace, "", fmt.Sprintf("%d", uID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}
	fmt.Println("this is objects", objects)
	appIDs := []int{}
	for _, object := range objects {
		if object[:3] == "org" {
			splittedObject := strings.Split(object, ":")
			orgID, err := strconv.Atoi(splittedObject[len(splittedObject)-3])
			if err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.DecodeError()))
				return
			}
			if orgID == oID {
				appID, err := strconv.Atoi(splittedObject[len(splittedObject)-1])
				if err != nil {
					loggerx.Error(err)
					errorx.Render(w, errorx.Parser(errorx.DecodeError()))
					return
				}
				appIDs = append(appIDs, appID)
			}
		}
	}
	applications := make([]model.Application, 0)
	for _, appID := range appIDs {
		application := &model.Application{}
		err = model.DB.Model(&model.Application{}).Where(&model.Application{
			Base: model.Base{
				ID: uint(appID),
			},
		}).Preload("Users").Preload("Users.Medium").Preload("Medium").Find(&application).Error
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DecodeError()))
			return
		}
		err = model.DB.Model(&model.Space{}).Where(&model.Space{
			ApplicationID:  uint(appID),
			OrganisationID: uint(oID),
		}).Preload("Users").Find(&application.Spaces).Error
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}

		err = model.DB.Model(&model.ApplicationToken{}).Where(&model.ApplicationToken{
			ApplicationID:  uint(appID),
			OrganisationID: uint(oID),
		}).Find(&application.Tokens).Error
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
		applications = append(applications, *application)
	}

	renderx.JSON(w, http.StatusOK, applications)
}
