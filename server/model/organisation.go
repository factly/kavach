package model

import (
	"errors"

	"gorm.io/gorm"
)

// Organisation model definition
type Organisation struct {
	Base
	Title             string               `gorm:"column:title" json:"title"`
	Slug              string               `gorm:"column:slug" json:"slug"`
	Description       string               `gorm:"column:description" json:"description"`
	FeaturedMediumID  *uint                `gorm:"column:featured_medium_id;default:NULL" json:"featured_medium_id"`
	Medium            *Medium              `gorm:"foreignKey:featured_medium_id" json:"medium"`
	Applications      []Application        `gorm:"foreignKey:organisation_id" json:"applications"`
	OrganisationUsers []OrganisationUser   `gorm:"foreignKey:organisation_id" json:"organisation_users"`
	Roles             []OrganisationRole   `gorm:"foreignKey:organisation_id" json:"roles"`
	Policies          []OrganisationPolicy `gorm:"foreignKey:organisation_id" json:"policies"`
}

// OrganisationUser model definition
type OrganisationUser struct {
	Base
	UserID         uint          `gorm:"column:user_id" json:"user_id"`
	User           *User         `gorm:"foreignKey:user_id" json:"user"`
	OrganisationID uint          `gorm:"column:organisation_id" json:"organisation_id"`
	Organisation   *Organisation `gorm:"foreignKey:organisation_id" json:"organisation"`
	Role           string        `gorm:"column:role" json:"role"`
}

type OrganisationToken struct {
	Base
	Name           string        `gorm:"column:name" json:"name"`
	Description    string        `gorm:"column:description" json:"description"`
	OrganisationID uint          `gorm:"column:organisation_id" json:"organisation_id"`
	Organisation   *Organisation `gorm:"foreignKey:organisation_id" json:"organisation"`
	Token          string        `gorm:"column:token" json:"token"`
}

var organisationUserKey ContextKey = "organisation_user"

// BeforeSave - validation for medium
func (org *Organisation) BeforeSave(tx *gorm.DB) (e error) {
	if org.FeaturedMediumID != nil && *org.FeaturedMediumID > 0 {
		medium := Medium{}
		medium.ID = *org.FeaturedMediumID

		ctx := tx.Statement.Context
		userID := ctx.Value(organisationUserKey).(int)

		err := tx.Model(&medium).Where(&Medium{
			UserID: uint(userID),
		}).First(&medium).Error

		if err != nil {
			return errors.New("medium does not belong to same user")
		}
	}

	return nil
}

// BeforeCreate hook
func (org *Organisation) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(organisationUserKey)

	if userID == nil {
		return nil
	}
	uID := userID.(int)

	org.CreatedByID = uint(uID)
	org.UpdatedByID = uint(uID)
	return nil
}

// BeforeCreate hook
func (orgUser *OrganisationUser) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(organisationUserKey)

	if userID == nil {
		return nil
	}
	uID := userID.(int)

	orgUser.CreatedByID = uint(uID)
	orgUser.UpdatedByID = uint(uID)
	return nil
}
