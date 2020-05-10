package model

import (
	"github.com/jinzhu/gorm"
)

// Organization model definition
type Organization struct {
	gorm.Model
	Title string `gorm:"column:title" json:"title"`
	Slug  string `gorm:"column:slug;unique_index" json:"slug"`
}

// OrganizationUser model definition
type OrganizationUser struct {
	gorm.Model
	UserID         uint   `gorm:"column:user_id" json:"user_id"`
	User           User   `gorm:"foreignkey:user_id;association_foreignkey:id" json:"user"`
	OrganizationID uint   `gorm:"column:organization_id" json:"organizationt_id" json:"organization_id"`
	Role           string `gorm:"column:role" json:"role"`
}
