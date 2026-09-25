package invite

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/factly/kavach-server/model"
	keto "github.com/factly/kavach-server/util/keto/relationTuple"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// accept - Accept organisation invite
// @Summary Accept organisation invite
// @Description Accepting organisation invite
// @Tags Invite
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param invite_id path string true "Invitation ID"
// @Failure 400 {array} string
// @Router /profile/invite/{invite_id} [put]
func accept(w http.ResponseWriter, r *http.Request) {
	invitationID := chi.URLParam(r, "invite_id")
	invID, err := strconv.Atoi(invitationID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	userID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	tx := model.DB.Begin()

	// Organisation and role come from the caller's own pending invitation, never from the request body.
	invitation := model.Invitation{}
	err = tx.Clauses(clause.Locking{Strength: "UPDATE"}).
		Where("id = ? AND invitee_id = ? AND status = ? AND expired_at > ?", invID, userID, false, time.Now()).
		First(&invitation).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
			return
		}
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// Check if invitee already exist in organisation
	var totPermissions int64
	err = tx.Model(&model.OrganisationUser{}).
		Where("organisation_id = ? AND user_id = ?", invitation.OrganisationID, userID).
		Count(&totPermissions).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	if totPermissions != 0 {
		tx.Rollback()
		loggerx.Error(errors.New("user already exist in organisation"))
		errorx.Render(w, errorx.Parser(errorx.CannotSaveChanges()))
		return
	}

	err = tx.Model(&invitation).Update("status", true).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// adding user to organisation
	orgUser := &model.OrganisationUser{
		UserID:         uint(userID),
		OrganisationID: invitation.OrganisationID,
		Role:           invitation.Role,
	}
	err = tx.Model(&model.OrganisationUser{}).Create(orgUser).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// Keto is written last so a failed DB write never leaves a permission behind.
	tuple := &model.KetoRelationTupleWithSubjectID{
		KetoSubjectSet: model.KetoSubjectSet{
			Namespace: "organisations",
			Object:    fmt.Sprintf("org:%d", invitation.OrganisationID),
			Relation:  invitation.Role,
		},
		SubjectID: fmt.Sprintf("%d", userID),
	}

	err = keto.CreateRelationTupleWithSubjectID(tuple)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	err = tx.Commit().Error
	if err != nil {
		loggerx.Error(err)
		if delErr := keto.DeleteRelationTupleWithSubjectID(tuple); delErr != nil {
			loggerx.Error(delErr)
		}
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusOK, nil)
}
