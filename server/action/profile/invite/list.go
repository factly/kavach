package invite

import (
	"net/http"
	"strconv"
	"time"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

type invitationData struct {
	model.Invitation
	model.Organisation `json:"organisation"`
	model.User         `json:"invited_by"`
}

// list - Get all organisation invitation
// @Summary Get all the organisation invitation
// @Description Listing all the invitations for a user
// @Tags Invite
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Success 201 {array} []invitationData
// @Failure 400 {array} string
// @Router /profile/invite/ [get]
func listInvitations(w http.ResponseWriter, r *http.Request) {
	userID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	db := model.DB.WithContext(r.Context())
	invitationList := make([]model.Invitation, 0)
	err = db.Model(model.Invitation{}).Where("invitee_id=? AND status=? and expired_at>?", uint(userID), false, time.Now()).Find(&invitationList).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	responseData := make([]invitationData, 0, len(invitationList))
	if len(invitationList) == 0 {
		renderx.JSON(w, http.StatusOK, responseData)
		return
	}

	orgIDs := make([]uint, 0, len(invitationList))
	inviterIDs := make([]uint, 0, len(invitationList))
	for _, each := range invitationList {
		orgIDs = append(orgIDs, each.OrganisationID)
		inviterIDs = append(inviterIDs, each.CreatedByID)
	}

	organisations := make([]model.Organisation, 0)
	if err = db.Where("id IN ?", orgIDs).Find(&organisations).Error; err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	organisationByID := make(map[uint]model.Organisation, len(organisations))
	for _, org := range organisations {
		organisationByID[org.ID] = org
	}

	inviters := make([]model.User, 0)
	if err = db.Where("id IN ?", inviterIDs).Find(&inviters).Error; err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	inviterByID := make(map[uint]model.User, len(inviters))
	for _, inviter := range inviters {
		inviterByID[inviter.ID] = inviter
	}

	for _, each := range invitationList {
		responseData = append(responseData, invitationData{
			Invitation:   each,
			Organisation: organisationByID[each.OrganisationID],
			User:         inviterByID[each.CreatedByID],
		})
	}
	renderx.JSON(w, http.StatusOK, responseData)
}
