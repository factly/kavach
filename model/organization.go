package model

// Organization model definition
type Organization struct {
	Base
	Title string `gorm:"column:title" json:"title"`
	Slug  string `gorm:"column:slug;unique_index" json:"slug"`
}

// OrganizationUser model definition
type OrganizationUser struct {
	Base
	UserID         uint          `gorm:"column:user_id" json:"user_id"`
	User           *User         `gorm:"foreignkey:user_id;association_foreignkey:id" json:"user"`
	OrganizationID uint          `gorm:"column:organization_id" json:"organization_id" json:"organization_id"`
	Organization   *Organization `gorm:"foreignkey:organization_id;association_foreignkey:id" json:"organization"`
	Role           string        `gorm:"column:role" json:"role"`
}
