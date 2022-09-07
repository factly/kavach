package model

import (
	"github.com/jinzhu/gorm/dialects/postgres"
)

type OrganisationPolicy struct {
	Base
	Name           string             `gorm:"column:name" json:"name"`
	Slug           string             `gorm:"column:slug" json:"slug"`
	Description    string             `gorm:"column:description" json:"description"`
	OrganisationID uint               `gorm:"column:organisation_id" json:"organisation_id"`
	Organisation   *Organisation      `gorm:"foreignKey:organisation_id" json:"organisation,omitempty"`
	Permissions    postgres.Jsonb     `gorm:"column:permissions" json:"permissions"`
	Roles          []OrganisationRole `gorm:"many2many:organisation_policy_roles;" json:"roles"`
}

type ApplicationPolicy struct {
	Base
	Name           string            `gorm:"column:name" json:"name"`
	Slug           string            `gorm:"column:slug" json:"slug"`
	Description    string            `gorm:"column:description" json:"description"`
	ApplicationID  uint              `gorm:"column:application_id" json:"application_id"`
	Application    *Application      `gorm:"foreignKey:application_id" json:"application,omitempty"`
	OrganisationID uint              `gorm:"column:organisation_id" json:"organisation_id"`
	Organisation   *Organisation     `gorm:"foreignKey:organisation_id" json:"organisation"`
	Permissions    postgres.Jsonb    `gorm:"column:permissions" json:"permissions"`
	Roles          []ApplicationRole `gorm:"many2many:application_policy_roles;" json:"roles"`
}

type SpacePolicy struct {
	Base
	Name        string         `gorm:"column:name" json:"name"`
	Slug        string         `gorm:"column:slug" json:"slug"`
	Description string         `gorm:"column:description" json:"description"`
	SpaceID     uint           `gorm:"column:space_id" json:"space_id"`
	Space       *Space         `gorm:"foreignKey:space_id" json:"space,omitempty"`
	Permissions postgres.Jsonb `gorm:"column:permissions" json:"permissions"`
	Roles       []SpaceRole    `gorm:"many2many:space_policy_roles;" json:"roles"`
}
