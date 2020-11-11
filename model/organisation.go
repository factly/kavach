package model

// Organisation model definition
type Organisation struct {
	Base
	Title            string  `gorm:"column:title" json:"title"`
	Slug             string  `gorm:"column:slug" json:"slug"`
	Description      string  `gorm:"column:description" json:"description"`
	FeaturedMediumID *uint   `gorm:"column:featured_medium_id;default:NULL" json:"featured_medium_id"`
	Medium           *Medium `gorm:"foreignKey:featured_medium_id" json:"medium"`
}

// OrganisationUser model definition
type OrganisationUser struct {
	Base
	UserID         uint          `gorm:"column:user_id" json:"user_id"`
	User           *User         `json:"user"`
	OrganisationID uint          `gorm:"column:organisation_id" json:"organisation_id"`
	Organisation   *Organisation `json:"organisation"`
	Role           string        `gorm:"column:role" json:"role"`
}
