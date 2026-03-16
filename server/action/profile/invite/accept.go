package invite

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	keto "github.com/factly/kavach-server/util/keto/relationTuple"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

type acceptInvite struct {
	OrgID     int32  `json:"organisation_id"`
	InviterID int64  `json:"inviter_id"`
	Role      string `json:"role"`
}

// accept - Accept organisation invite
// @Summary Accept organisation invite
// @Description Accepting organisation invite
// @Tags Invite
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param invite_id path string true "Invitation ID"
// @Param Invite body acceptInvite true "Accept Invite Object"
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

	var response acceptInvite
	err = json.NewDecoder(r.Body).Decode(&response)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	filter := model.Invitation{
		Base: model.Base{
			ID: uint(invID),
		},
	}

	tx := model.DB.Begin()
	err = tx.Model(&model.Invitation{}).Where(&filter).Update("status", model.Accepted).Error
	if err != nil {
		loggerx.Error(err)
		tx.Rollback()
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	orgUser := &model.OrganisationUser{
		UserID:         uint(userID),
		OrganisationID: uint(response.OrgID),
		Role:           response.Role,
	}

	// Check if invitee already exist in organisation
	var totPermissions int64
	permission := &model.OrganisationUser{}
	permission.OrganisationID = uint(response.OrgID)
	permission.UserID = uint(userID)

	tx.Model(&model.OrganisationUser{}).Where(permission).Count(&totPermissions)
	if totPermissions != 0 {
		tx.Rollback()
		loggerx.Error(errors.New("user already exist in organisation"))
		errorx.Render(w, errorx.Parser(errorx.CannotSaveChanges()))
	}

	// creating a relation tuple for users which are owner in keto api
	tuple := &model.KetoRelationTupleWithSubjectID{
		KetoSubjectSet: model.KetoSubjectSet{
			Namespace: "organisations",
			Object:    fmt.Sprintf("org:%d", response.OrgID),
			Relation:  response.Role,
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

	// adding user to organisation
	err = tx.Model(&model.OrganisationUser{}).Create(orgUser).Error
	if err != nil {
		loggerx.Error(err)
		tx.Rollback()
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Commit()
	renderx.JSON(w, http.StatusOK, nil)
}
