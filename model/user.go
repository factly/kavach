package model

import (
	"errors"

	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// User model definition
type User struct {
	Base
	Email            string         `gorm:"column:email;uniqueIndex" json:"email"`
	KID              string         `gorm:"column:kid;" json:"kid"`
	FirstName        string         `gorm:"column:first_name" json:"first_name"`
	LastName         string         `gorm:"column:last_name" json:"last_name"`
	DisplayName      string         `gorm:"column:display_name" json:"display_name"`
	BirthDate        string         `gorm:"column:birth_date" json:"birth_date"`
	Gender           string         `gorm:"column:gender" json:"gender"`
	FeaturedMediumID *uint          `gorm:"column:featured_medium_id;default:NULL" json:"featured_medium_id"`
	Medium           *Medium        `gorm:"foreignKey:featured_medium_id" json:"medium"`
	SocialMediaURLs  postgres.Jsonb `gorm:"column:social_media_urls" json:"social_media_urls"`
	Description      string         `gorm:"column:description" json:"description"`
}

// BeforeUpdate - validation for medium
func (user *User) BeforeUpdate(tx *gorm.DB) (e error) {
	if user.FeaturedMediumID != nil && *user.FeaturedMediumID > 0 {
		medium := Medium{}
		medium.ID = *user.FeaturedMediumID

		err := tx.Model(&medium).Where(&Medium{
			UserID: user.ID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("medium do not belong to same user")
		}
	}

	return nil
}
