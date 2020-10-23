package model

// Organisation model definition
type Organisation struct {
	Base
	Title string `gorm:"column:title" json:"title"`
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
