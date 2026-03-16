package model

import "time"

type Status string

const (
	Pending  Status = "pending"
	Rejected Status = "rejected"
	Accepted Status = "accepted"
)

// Invitation model definition
type Invitation struct {
	Base
	InviteeID      uint      `gorm:"column:invitee_id" json:"invitee_id"`
	OrganisationID uint      `gorm:"column:organisation_id" json:"organisation_id"`
	Role           string    `gorm:"column:role" json:"role"`
	Status         Status    `gorm:"column:status" json:"status"`
	ExpiredAt      time.Time `json:"expired_at"`
}

var InvitationKey ContextKey = "invitation"
