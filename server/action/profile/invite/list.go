package invite

import (
	"context"
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

func listInvitations(w http.ResponseWriter, r *http.Request) {
	userID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}
	// var responseData invitationData
	var invitationContext model.ContextKey = "invitation_user"
	tx := model.DB.WithContext(context.WithValue(r.Context(), invitationContext, userID)).Begin()
	invitationList := make([]model.Invitation, 0)
	err = tx.Model(model.Invitation{}).Where("invitee_id=? AND status=? and expired_at>?", uint(userID), false, time.Now()).Find(&invitationList).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	responseData := make([]invitationData, 0)
	for _, each := range invitationList {
		var eachInvitation invitationData
		eachInvitation.Invitation = each
		tx := model.DB.WithContext(context.WithValue(r.Context(), invitationContext, userID)).Begin()
		err = tx.Where(&model.Organisation{
			Base: model.Base{
				ID: each.OrganisationID,
			},
		}).Find(&eachInvitation.Organisation).Error

		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}

		err = tx.Where(&model.User{
			Base: model.Base{
				ID: each.CreatedByID,
			},
		}).Find(&eachInvitation.User).Error

		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
		responseData = append(responseData, eachInvitation)
	}
	renderx.JSON(w, http.StatusOK, responseData)
}
