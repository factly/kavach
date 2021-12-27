package user

import (
	"errors"
	"github.com/factly/kavach-server/model"
	"gorm.io/gorm"
)

// createInvite adds invitation into the invite table with the default status false
func createInvite(tx *gorm.DB, invitation model.Invitation) (uint, error) {
	var invitationCount int64
	tx.Model(&model.Invitation{}).Where(&model.Invitation{
		InviteeID:      uint(invitation.InviteeID),
		OrganisationID: uint(invitation.OrganisationID),
	}).Count(&invitationCount)

	if invitationCount > 0 {
		return 0, errors.New("invitation already exists")
	}
	err := tx.Model(&model.Invitation{}).Create(&invitation).Error
	if err != nil {
		return 0, err
	}
	return invitation.ID, nil
}
