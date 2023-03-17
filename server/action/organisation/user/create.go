package user

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util"
	"github.com/factly/kavach-server/util/email"
	"github.com/factly/kavach-server/util/kratos"
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
type FailedInvite struct {
	Email   string `json:"email"`
	Message string `json:"message"`
}

type Response struct {
	FailedInvites []FailedInvite `json:"failed_invites"`
	Invitations   []invite       `json:"invitations"`
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
	// get return_to from query params
	return_to := r.URL.Query().Get("return_to")
	// return error if return_to is empty
	if return_to == "" {
		loggerx.Error(errors.New("return_to is empty"))
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	disableInvite := r.URL.Query().Get("disable_invite")

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
	inviteeCounts := make(map[string]int64)

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
		err = tx.Model(&model.Invitation{}).
			Where("invitee_id=? AND organisation_id=? AND status=? AND role=? AND expired_at<?", invitee.ID, uint(orgID), invitation.Status, invitation.Role, time.Now().AddDate(0, 0, 7)).
			Count(&invitationCount).Error

		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			return
		}
		if invitationCount > 0 {
			inviteeCounts[invitee.Email]++
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

		var count int64
		err = model.DB.Model(&model.User{}).Where("email=?", user.Email).Count(&count).Error
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
		if viper.GetBool("disable_registration") && count == 0 {
			id, err := kratos.CreateKratosIdentity(user.Email)
			if err != nil {
				tx.Rollback()
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.DBError()))
				return
			}
			err = tx.Model(&model.User{}).Where("email=?", user.Email).Update("kid", id).Error
			if err != nil {
				tx.Rollback()
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.DBError()))
				return
			}
			var response *kratos.RecoveryResponse
			response, err = kratos.CreateRecoveryLink("168h", id)
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
				ActionURL:        response.RecoveryURL,
			}
			err = email.SendmailwithSendGrid(receiver)
			if err != nil {
				// tx.Rollback()
				loggerx.Error(err)
				// errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				// return
			}
		} else {
			//domainName := viper.GetString("domain_name")
			receiver := email.MailReceiver{
				InviteeName:      user.FirstName + " " + user.LastName,
				InviteeEmail:     user.Email,
				Role:             user.Role,
				OrganisationName: fmt.Sprintf("%v", organisationMap[0]["title"]),
			}
			// if count == 0 {
			return_to, err := decodeURLIfNeeded(return_to)
			if err != nil {
				loggerx.Error(errors.New("decode error"))
			}
			receiver.ActionURL = return_to
			// } else {
			// 	receiver.ActionURL = return_to
			// }
			if disableInvite != "true" {
				err = email.SendmailwithSendGrid(receiver)
				if err != nil {
					// tx.Rollback()
					loggerx.Error(err)
					// errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
					// return
				}
			}

		}
		tx.Commit()
	}
	var failedInvites []FailedInvite
	var invitations []invite
	for _, user := range req.Users {
		if count, exists := inviteeCounts[user.Email]; exists && count >= 1 {
			failedInvites = append(failedInvites, FailedInvite{
				Email:   user.Email,
				Message: "invite already exists",
			})
		} else {
			invitations = append(invitations, user)
		}
	}
	var resp Response
	if len(failedInvites) > 0 {
		resp.FailedInvites = failedInvites
	} else {
		resp.FailedInvites = []FailedInvite{}
	}
	if len(invitations) > 0 {
		resp.Invitations = invitations
	} else {
		resp.Invitations = []invite{}
	}
	renderx.JSON(w, http.StatusOK, resp)
}

func decodeURLIfNeeded(urlString string) (string, error) {
	u, err := url.Parse(urlString)
	if err != nil {
		return "", err
	}

	// Check if the URL is encoded
	if u.RawQuery != "" || u.Fragment != "" {
		// Decode the URL
		decodedURL, err := url.QueryUnescape(urlString)
		if err != nil {
			return "", err
		}
		return decodedURL, nil
	}

	// The URL is not encoded, return the original URL string
	return urlString, nil
}
