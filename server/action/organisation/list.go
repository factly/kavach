package organisation

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/application"
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

	allOrganisations := make([]orgWithRole, 0)
	for _, orgID := range orgIDs {
		org := orgWithRole{}
		org.Organisation.ID = uint(orgID)
		err = model.DB.Model(&model.Organisation{}).Where(&model.Organisation{
			Base: model.Base{
				ID: uint(orgID),
			},
		}).Preload("Medium").Preload("Applications").Preload("OrganisationUsers").Preload("OrganisationUsers.User").Preload("Roles").Preload("Roles.Users").Preload("Policies").Preload("Policies.Roles").First(&org.Organisation).Error
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

		org.AllApplications = org.Organisation.Applications
		defaultApps, err := application.GetDefaultApplicationByOrgID(uint(userID), uint(orgID))
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
		org.AllApplications = append(org.AllApplications, defaultApps...)
		org.Organisation.Applications = org.AllApplications
		allOrganisations = append(allOrganisations, org)
	}

	renderx.JSON(w, http.StatusOK, allOrganisations)
}
