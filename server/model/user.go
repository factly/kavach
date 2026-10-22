package model

import (
	"errors"
	"time"

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
	Slug             string         `gorm:"column:slug" json:"slug"`
	DisplayName      string         `gorm:"column:display_name" json:"display_name"`
	BirthDate        *time.Time     `gorm:"column:birth_date; default:NULL" json:"birth_date"`
	Gender           string         `gorm:"column:gender" json:"gender"`
	FeaturedMediumID *uint          `gorm:"column:featured_medium_id;default:NULL" json:"featured_medium_id"`
	Medium           *Medium        `gorm:"foreignKey:featured_medium_id" json:"medium"`
	SocialMediaURLs  postgres.Jsonb `gorm:"column:social_media_urls" json:"social_media_urls" swaggertype:"primitive,string"`
	Description      string         `gorm:"column:description" json:"description"`
	Meta             postgres.Jsonb `gorm:"column:meta" json:"meta" swaggertype:"primitive,string"`
	IsActive         bool           `gorm:"column:is_active" json:"is_active" `
	Organisations    []Organisation `gorm:"many2many:organisation_users;" json:"organisations"`
}

// MemberFields limits a user query to the columns other members of an
// organisation may see. Use it on every query or preload whose users are
// rendered to someone other than the user themselves, so that kid,
// birth_date, gender, social_media_urls, description and meta are never loaded.
func MemberFields(db *gorm.DB) *gorm.DB {
	return db.Select("id", "created_at", "updated_at", "email", "first_name", "last_name", "slug", "display_name", "featured_medium_id", "is_active")
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
