package organisation

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/util"
	keto "github.com/factly/kavach-server/util/keto/relationTuple"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// delete - Delete organisation by id
// @Summary Delete a organisation
// @Description Delete organisation by ID
// @Tags Organisation
// @ID delete-organisation-by-id
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Success 200
// @Router /organisations/{organisation_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {
	organisationID := chi.URLParam(r, "organisation_id")
	orgID, err := strconv.Atoi(organisationID)

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
	hostID, err := strconv.Atoi(r.Header.Get("X-User"))

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	err = util.CheckOwner(uint(hostID), uint(orgID))

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// Delete all organisation_users associations
	orgUsers := model.OrganisationUser{
		OrganisationID: uint(orgID),
	}

	tx := model.DB.Begin()

	tx.Where(&orgUsers).Delete(&orgUsers)

	// delete
	tx.Delete(&organisation)
	// Deleting the all the relation tuple related to "orgnanisation" object 
	tuple := &model.KetoRelationTupleWithSubjectID{
		KetoSubjectSet: model.KetoSubjectSet{
			Namespace: "organisations",
			Object:    fmt.Sprintf("org:%d", orgID),
			Relation:  "", // relation is an empty string to avoid addition of the relation query parameter
		},
		SubjectID: "",
	}
	err = keto.DeleteRelationTupleWithSubjectID(tuple)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	tx.Commit()

	renderx.JSON(w, http.StatusOK, nil)
}
