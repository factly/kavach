package model

import (
	"github.com/lib/pq"
)

type OrganisationPolicy struct {
	Base
	Name           string             `gorm:"column:name" json:"name"`
	Description    string             `gorm:"column:description" json:"description"`
	OrganisationID uint               `gorm:"column:organisation_id" json:"organisation_id"`
	Organisation   *Organisation      `gorm:"foreignKey:organisation_id" json:"organisation,omitempty"`
	Permissions    []Permission       `gorm:"many2many:organisation_permissions" json:"permissions"`
	Roles          []OrganisationRole `gorm:"many2many:organisation_policy_roles;" json:"roles"`
}

type ApplicationPolicy struct {
	Base
	Name          string            `gorm:"column:name" json:"name"`
	Description   string            `gorm:"column:description" json:"description"`
	ApplicationID uint              `gorm:"column:application_id" json:"application_id"`
	Application   *Application      `gorm:"foreignKey:application_id" json:"application,omitempty"`
	Permissions   []Permission      `gorm:"many2many:application_permissions" json:"permissions"`
	Roles         []ApplicationRole `gorm:"many2many:application_policy_roles;" json:"roles"`
}

type SpacePolicy struct {
	Base
	Name        string       `gorm:"column:name" json:"name"`
	Description string       `gorm:"column:description" json:"description"`
	SpaceID     uint         `gorm:"column:space_id" json:"space_id"`
	Space       *Space       `gorm:"foreignKey:space_id" json:"space,omitempty"`
	Permissions []Permission `gorm:"many2many:space_permissions" json:"permissions"`
	Roles       []SpaceRole  `gorm:"many2many:space_policy_roles;" json:"roles"`
}

type Permission struct {
	Base
	Resource string         `gorm:"column:resource" json:"resource"`
	Actions  pq.StringArray `gorm:"column:actions;type:text[]" json:"actions"`
}
