package user

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util"
	"github.com/factly/kavach-server/util/email"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
	"github.com/spf13/viper"
)

type invites struct {
	Users []invite `json:"users"`
}

type invite struct {
	FirstName string `gorm:"column:first_name" json:"first_name" validate:"required"`
	LastName  string `gorm:"column:last_name" json:"last_name"`
	Email     string `json:"email" validate:"required"`
	Role      string `json:"role" validate:"required"`
}

// create - Create organisation user
// @Summary Create organisation user
// @Description Create organisation user
// @Tags OrganisationUser
// @ID add-organisation-user
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param Invite body invites true "Invite Object"
// @Success 201 {array} userWithPermission
// @Failure 400 {array} string
// @Router /organisations/{organisation_id}/users [post]
func create(w http.ResponseWriter, r *http.Request) {
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

	// FindOrCreate invitee
	req := invites{}
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}
	for _, user := range req.Users {
		validationError := validationx.Check(user)
		if validationError != nil {
			loggerx.Error(errors.New("validation error"))
			errorx.Render(w, validationError)
			return
		}
	}

	for _, user := range req.Users {
		tx := model.DB.WithContext(context.WithValue(r.Context(), userContext, currentUID)).Begin()
		invitee := model.User{
			Email:     user.Email,
			FirstName: user.FirstName,
			LastName:  user.LastName,
		}

		err = tx.Where(&model.User{
			Email: invitee.Email,
		}).First(&invitee).Error

		if err != nil {
			tx.Create(&invitee)
		}

		invitation := &model.Invitation{
			Base: model.Base{
				CreatedByID: uint(currentUID),
			},
			InviteeID:      invitee.ID,
			Status:         false,
			Role:           user.Role,
			OrganisationID: uint(orgID),
			ExpiredAt:      time.Now().AddDate(0, 0, 7),
		}

		var invitationCount int64
		tx.Model(&model.Invitation{}).Where(&model.Invitation{
			InviteeID:      uint(invitation.InviteeID),
			OrganisationID: uint(invitation.OrganisationID),
		}).Count(&invitationCount)

		if invitationCount > 0 {
			loggerx.Error(err)
			continue
		}
		err := tx.Model(&model.Invitation{}).Create(&invitation).Error
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}

		var organisationMap []map[string]interface{}
		err = model.DB.Model(model.Organisation{}).Select("title").Where("id=?", orgID).Find(&organisationMap).Error
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}

		receiver := email.MailReceiver{
			InviteeName:      user.FirstName + " " + user.LastName,
			InviteeEmail:     user.Email,
			Role:             user.Role,
			OrganisationName: fmt.Sprintf("%v", organisationMap[0]["title"]),
		}
		var count int64
		err = model.DB.Model(&model.User{}).Where("email=?", user.Email).Count(&count).Error
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
		domainName := viper.GetString("domain_name")

		if count == 0 {
			receiver.ActionURL = domainName + "/auth/registration"
		} else {
			receiver.ActionURL = domainName + "/web/profile/invite"
		}

		err = email.SendmailwithSendGrid(receiver)
		if err != nil {
			// tx.Rollback()
			loggerx.Error(err)
			// errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			// return
		}
		tx.Commit()
	}
	renderx.JSON(w, http.StatusOK, nil)
}
