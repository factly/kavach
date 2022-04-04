package model

import (
	"errors"

	"gorm.io/gorm"
)

// Application model defination
type Application struct {
	Base
	Name           string             `gorm:"column:name" json:"name"`
	Slug           string             `gorm:"column:slug" json:"slug"`
	Description    string             `gorm:"column:description" json:"description"`
	URL            string             `gorm:"column:url" json:"url"`
	MediumID       *uint              `gorm:"column:medium_id;default:NULL" json:"medium_id"`
	Medium         *Medium            `gorm:"foreignKey:medium_id" json:"medium"`
	OrganisationID uint               `gorm:"column:organisation_id" json:"organisation_id"`
	Organisation   *Organisation      `gorm:"foreignKey:organisation_id" json:"organisation,omitempty"`
	Spaces         []*Space           `gorm:"foreignKey:application_id" json:"spaces,omitempty"`
	Users          []User             `gorm:"many2many:application_users;" json:"users"`
	Tokens         []ApplicationToken `json:"tokens"`
	Roles          []ApplicationRole  `gorm:"foreignKey:application_id" json:"application_role"`
}

type ApplicationToken struct {
	Base
	Name          string       `gorm:"column:name" json:"name"`
	Description   string       `gorm:"column:description" json:"description"`
	ApplicationID *uint        `gorm:"column:application_id" json:"application_id"`
	Application   *Application `gorm:"foreignKey:application_id" json:"application"`
	Token         string       `gorm:"column:token" json:"token"`
}

var applicationUserKey ContextKey = "application_user"

// BeforeCreate hook
func (application *Application) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(applicationUserKey)

	if userID == nil {
		return nil
	}
	uID := userID.(int)

	application.CreatedByID = uint(uID)
	application.UpdatedByID = uint(uID)
	return nil
}

// BeforeSave - validation for medium
func (application *Application) BeforeSave(tx *gorm.DB) (e error) {
	if application.MediumID != nil && *application.MediumID > 0 {
		medium := Medium{}
		medium.ID = *application.MediumID

		ctx := tx.Statement.Context
		userID := ctx.Value(applicationUserKey).(int)

		err := tx.Model(&Medium{}).Where(&Medium{
			UserID: uint(userID),
		}).First(&medium).Error

		if err != nil {
			return errors.New("medium does not belong to same user")
		}
	}

	return nil
}
