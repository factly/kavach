package user

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	keto "github.com/factly/kavach-server/util/keto/relationTuple"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
	"gorm.io/gorm/clause"
)

type roleUpdate struct {
	Role string `json:"role" validate:"required,oneof=owner member"`
}

// update - Change an organisation user's role (admin)
// @Summary Change organisation user role (admin)
// @Description Change the role of a user in an organisation. The last owner cannot be demoted.
// @Tags AdminOrganisationUser
// @ID update-admin-organisation-user-role
// @Consume json
// @Produce json
// @Param X-KAVACH-MASTER-KEY header string true "Master Key"
// @Param organisation_id path string true "Organisation ID"
// @Param user_id path string true "User ID"
// @Param Role body roleUpdate true "New role"
// @Success 200 {object} model.OrganisationUser
// @Router /admin/organisations/{organisation_id}/users/{user_id} [put]
func update(w http.ResponseWriter, r *http.Request) {
	orgID, err := strconv.Atoi(chi.URLParam(r, "organisation_id"))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	uID, err := strconv.Atoi(chi.URLParam(r, "user_id"))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	req := roleUpdate{}
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}
	validationError := validationx.Check(req)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	tx := model.DB.Begin()
	defer tx.Rollback()

	orgUser := model.OrganisationUser{}
	err = tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where(&model.OrganisationUser{
		OrganisationID: uint(orgID),
		UserID:         uint(uID),
	}).First(&orgUser).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	if orgUser.Role == req.Role {
		renderx.JSON(w, http.StatusOK, orgUser)
		return
	}

	if orgUser.Role == "owner" {
		owners, err := countOwnersForUpdate(tx, uint(orgID))
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
		if owners < 2 {
			loggerx.Error(errors.New("cannot demote last owner of organisation"))
			errorx.Render(w, errorx.Parser(errorx.CannotSaveChanges()))
			return
		}
	}

	oldRole := orgUser.Role
	err = tx.Model(&orgUser).Update("role", req.Role).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// Grant the new role before revoking the old one, so a keto failure never
	// leaves the user with no access at all
	oldTuple := orgTuple(uint(orgID), uint(uID), oldRole)
	newTuple := orgTuple(uint(orgID), uint(uID), req.Role)
	err = keto.CreateRelationTupleWithSubjectID(newTuple)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	err = keto.DeleteRelationTupleWithSubjectID(oldTuple)
	if err != nil {
		loggerx.Error(err)
		revoke(newTuple)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	err = tx.Commit().Error
	if err != nil {
		loggerx.Error(err)
		// the role change was rolled back, so restore the old grant
		if kerr := keto.CreateRelationTupleWithSubjectID(oldTuple); kerr != nil {
			loggerx.Error(kerr)
		}
		revoke(newTuple)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	orgUser.Role = req.Role
	renderx.JSON(w, http.StatusOK, orgUser)
}

// revoke best-effort deletes a tuple written earlier in a request that failed
func revoke(tuple *model.KetoRelationTupleWithSubjectID) {
	if err := keto.DeleteRelationTupleWithSubjectID(tuple); err != nil {
		loggerx.Error(err)
	}
}
