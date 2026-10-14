package user

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"

	keto "github.com/factly/kavach-server/util/keto/relationTuple"
	"github.com/factly/kavach-server/util/user"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
	"gorm.io/gorm/clause"
)

// delete - Delete organisation user by id (admin)
// @Summary Delete a organisation user (admin)
// @Description Delete organisation user by ID (admin)
// @Tags AdminOrganisationUser
// @ID delete-admin-organisation-user-by-id
// @Param X-KAVACH-MASTER-KEY header string true "Master Key"
// @Param organisation_id path string true "Organisation ID"
// @Param user_id path string true "User ID"
// @Success 200
// @Router /admin/organisations/{organisation_id}/users/{user_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {
	/* Check if record exist */
	organisationID := chi.URLParam(r, "organisation_id")
	orgID, err := strconv.Atoi(organisationID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	userID := chi.URLParam(r, "user_id")
	uID, err := strconv.Atoi(userID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	tx := model.DB.Begin()
	defer tx.Rollback()

	result := &model.OrganisationUser{}

	// Check if record exist
	err = tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where(&model.OrganisationUser{
		OrganisationID: uint(orgID),
		UserID:         uint(uID),
	}).First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	// Check if the user to delete is not last owner of organisation
	if result.Role == "owner" {
		owners, err := countOwnersForUpdate(tx, uint(orgID))
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
		if owners < 2 {
			loggerx.Error(errors.New("cannot delete last owner of organisation"))
			errorx.Render(w, errorx.Parser(errorx.CannotSaveChanges()))
			return
		}
	}

	/* DELETE */
	err = tx.Delete(&model.OrganisationUser{}, result.ID).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	err = user.DeleteUserFromOrganisationRoles(uint(orgID), result.UserID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	err = user.DeleteUserFromApplications(uint(orgID), result.UserID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	err = keto.DeleteRelationTuplesOfSubjectIDInNamespace(namespace, fmt.Sprint(result.UserID), fmt.Sprintf("org:%d", orgID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	err = keto.DeleteRelationTuplesOfSubjectIDInNamespace("applications", fmt.Sprint(result.UserID), fmt.Sprintf("org:%d", orgID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	err = keto.DeleteRelationTuplesOfSubjectIDInNamespace("spaces", fmt.Sprint(result.UserID), fmt.Sprintf("org:%d", orgID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	err = tx.Commit().Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusOK, nil)
}
