package organisation

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/factly/kavach-server/model"
	keto "github.com/factly/kavach-server/util/keto/relationTuple"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

// list - Get all organisations
// @Summary Show all organisations
// @Description Get all organisations
// @Tags Organisation
// @ID get-all-my-organisations
// @Produce  json
// @Param X-User header string true "User ID"
// @Success 200 {array} []orgWithRole
// @Router /organisations/my [get]
func list(w http.ResponseWriter, r *http.Request) {
	userID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		renderx.JSON(w, http.StatusBadRequest, nil)
		return
	}

	objects, err := keto.ListObjectsBySubjectID(namespace, "", fmt.Sprintf("%d", userID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	orgIDs := []int{}

	for _, object := range objects {
		splittedObject := strings.Split(object, ":")
		if object[:3] == "org" {
			orgID, err := strconv.Atoi(splittedObject[len(splittedObject)-1])
			if err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.DecodeError()))
				return
			}
			orgIDs = append(orgIDs, orgID)
		}
	}
	appObjects, err := keto.ListObjectsBySubjectID("applications", "", fmt.Sprintf("%d", userID))
	if err != nil {
		loggerx.Error(err)
		return
	}
	allOrganisations := make([]orgWithRole, 0)
	for _, orgID := range orgIDs {
		org := orgWithRole{}
		org.Organisation.ID = uint(orgID)
		err = model.DB.Model(&model.Organisation{}).Where(&model.Organisation{
			Base: model.Base{
				ID: uint(orgID),
			},
		}).Preload("Medium").Preload("OrganisationUsers").Preload("OrganisationUsers.User").Preload("Roles").Preload("Roles.Users").Preload("Policies").Preload("Policies.Roles").First(&org.Organisation).Error
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
			return
		}

		err = model.DB.Model(&model.OrganisationUser{}).Where(&model.OrganisationUser{
			OrganisationID: uint(orgID),
			UserID:         uint(userID),
		}).First(&org.Permission).Error
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
			return
		}
		appIDs := make([]uint, 0)
		for _, object := range appObjects {
			objectID := fmt.Sprintf("org:%d:", orgID)
			if strings.HasPrefix(object, objectID) {
				splittedObject := strings.Split(object, ":")
				appID, err := strconv.Atoi(splittedObject[len(splittedObject)-1])
				if err != nil {
					loggerx.Error(err)
					errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
					return
				}
				appIDs = append(appIDs, uint(appID))
			}
		}
		allApplications := make([]model.Application, 0)
		for _, appID := range appIDs {
			app := model.Application{}
			err = model.DB.Model(&model.Application{}).Where(&model.Application{
				Base: model.Base{
					ID: appID,
				},
			}).Preload("Medium").Preload("Roles").Preload("Roles.Users").Preload("Policy").Preload("Policy.Roles").First(&app).Error
			if err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.DBError()))
				return
			}
			allApplications = append(allApplications, app)
		}
		org.AllApplications = allApplications
		org.Organisation.Applications = allApplications
		allOrganisations = append(allOrganisations, org)
	}

	renderx.JSON(w, http.StatusOK, allOrganisations)
}
