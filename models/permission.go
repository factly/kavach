package models

import (
	"github.com/jinzhu/gorm"
)

// Permission model definition
type Permission struct {
	gorm.Model
	Type           string       `gorm:"column:type" json:"type"`
	UserID         uint         `gorm:"column:user_id" json:"user_id"`
	User           User         `gorm:"foreignkey:user_id;association_foreignkey:id"`
	OrganizationID uint         `gorm:"column:organization_id" json:"organizationt_id"`
	Organization   Organization `gorm:"foreignkey:organization_id;association_foreignkey:id"`
	ServiceID      uint         `gorm:"column:service_id" json:"service_id"`
	Service        Service      `gorm:"foreignkey:service_id;association_foreignkey:id"`
}
