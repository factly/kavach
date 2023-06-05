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
	"gorm.io/gorm"
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
	// get return_to from query params
	return_to := r.URL.Query().Get("return_to")
	// return error if return_to is empty
	if return_to == "" {
		loggerx.Error(errors.New("return_to is empty"))
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
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
			if err == gorm.ErrRecordNotFound {
				tx.Create(&invitee)
			} else {
				loggerx.Error(errors.New("error creating invitee"))
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}

		// case 1: Invitation already exists and is pending
		// 					- Update ExpiredAt
		// case 2: Invitation already exists and is rejected
		// 					- Update ExpiredAt
		// 					- Update Status to Pending
		// case 3: Invitation does not exist
		// 					- Create Invitation
		// case 4: Invitation already exists and is accepted
		// 					- Return error

		invitation := &model.Invitation{
			Base: model.Base{
				CreatedByID: uint(currentUID),
			},
			InviteeID:      invitee.ID,
			Status:         model.Pending,
			Role:           user.Role,
			OrganisationID: uint(orgID),
		}

		err = tx.Model(&model.Invitation{}).Where("invitee_id = ? AND organisation_id = ? AND expired_at > ? AND created_by_id = ? AND role = ?", invitee.ID, orgID, time.Now(), currentUID, user.Role).First(&invitation).Error

		if err != nil {
			if err == gorm.ErrRecordNotFound {
				// create new invitation
				invitation.Status = model.Pending
				invitation.ExpiredAt = time.Now().AddDate(0, 0, 7)
				createErr := tx.Model(&model.Invitation{}).Create(invitation).Error
				if createErr != nil {
					loggerx.Error(createErr)
					errorx.Render(w, errorx.Parser(errorx.DBError()))
					return
				}
			} else {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.DBError()))
				return
			}
		} else {
			// check for all the cases
			if invitation.Status == model.Accepted {
				loggerx.Error(errors.New("invitation already accepted"))
				errorx.Render(w, errorx.Parser(errorx.GetMessage("invitation already accepted", http.StatusBadRequest)))
				return
			} else if invitation.Status == model.Rejected {
				invitation.Status = model.Pending
				updateErr := updateInvitation(tx, invitation)
				if updateErr != nil {
					tx.Rollback()
					loggerx.Error(updateErr)
					errorx.Render(w, errorx.Parser(errorx.DBError()))
					return
				}
			} else if invitation.Status == model.Pending {
				updateErr := updateInvitation(tx, invitation)
				if updateErr != nil {
					tx.Rollback()
					loggerx.Error(updateErr)
					errorx.Render(w, errorx.Parser(errorx.DBError()))
					return
				}
			}
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
			err = email.SendmailwithSendGrid(receiver)
			if err != nil {
				// tx.Rollback()
				loggerx.Error(err)
				// errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				// return
			}
		}
		in := &model.Invitation{}
		_ = tx.Model(&model.Invitation{}).Where("status = ?", model.Pending).First(&in).Error
		tx.Commit()
	}
	renderx.JSON(w, http.StatusOK, nil)
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

func updateInvitation(tx *gorm.DB, invitation *model.Invitation) error {
	invitation.ExpiredAt = time.Now().AddDate(0, 0, 7)
	filter := &model.Invitation{
		Base: model.Base{
			ID: invitation.ID,
		},
	}
	updateErr := tx.Model(&model.Invitation{}).Where(filter).Save(invitation).Error
	return updateErr
}
