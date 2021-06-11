package user

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/util/keto"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// delete - Delete organisation user by id
// @Summary Delete a organisation user
// @Description Delete organisation user by ID
// @Tags OrganisationUser
// @ID delete-organisation-user-by-id
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param user_id path string true "User ID"
// @Success 200
// @Router /organisations/{organisation_id}/users/{user_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {
	/* Check if record exist */
	organisationID := chi.URLParam(r, "organisation_id")
	orgID, err := strconv.Atoi(organisationID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	var currentUID int
	currentUID, err = strconv.Atoi(r.Header.Get("X-User"))

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	// Check if logged in user is owner
	err = util.CheckOwner(uint(currentUID), uint(orgID))

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.CannotSaveChanges()))
		return
	}

	userID := chi.URLParam(r, "user_id")
	uID, err := strconv.Atoi(userID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	result := &model.OrganisationUser{}

	// Check if record exist
	err = model.DB.Where(&model.OrganisationUser{
		OrganisationID: uint(orgID),
		UserID:         uint(uID),
	}).First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	// Check if the user to delete is not last owner of organisation
	var totalOwners int64
	model.DB.Model(&model.OrganisationUser{}).Where(&model.OrganisationUser{
		Role:           "owner",
		OrganisationID: uint(orgID),
	}).Count(&totalOwners)

	if result.Role == "owner" && totalOwners < 2 {
		loggerx.Error(errors.New("Cannot delete last user of organisation"))
		errorx.Render(w, errorx.Parser(errorx.CannotSaveChanges()))
		return
	}

	tx := model.DB.Begin()

	deletePermission := &model.OrganisationUser{}
	deletePermission.ID = result.ID

	/* DELETE */
	tx.Delete(&deletePermission)

	/* delete policy for admins */
	if result.Role == "owner" {
		err = keto.Delete("/engines/acp/ory/regex/roles/roles:org:" + fmt.Sprint(orgID) + ":admin/members/" + fmt.Sprint(result.UserID))

		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.NetworkError()))
			return
		}
	}

	tx.Commit()

	renderx.JSON(w, http.StatusOK, nil)
}
