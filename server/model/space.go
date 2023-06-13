package model

import (
	"github.com/jinzhu/gorm/dialects/postgres"
)

// Space model
type Space struct {
	Base
	Name           string         `gorm:"column:name" json:"name"`
	Slug           string         `gorm:"column:slug" json:"slug"`
	Description    string         `gorm:"description" json:"description"`
	MetaFields     postgres.Jsonb `gorm:"column:meta_fields" json:"meta_fields" swaggertype:"primitive,string"`
	OrganisationID uint           `gorm:"column:organisation_id" json:"organisation_id"`
	Organisation   *Organisation  `gorm:"foreignKey:organisation_id" json:"organisation"`
	ApplicationID  uint           `gorm:"column:application_id" json:"application_id"`
	Application    *Application   `gorm:"foreignKey:application_id" json:"application"`
	MediumID       *uint          `gorm:"column:medium_id" json:"medium_id,omitempty"`
	Medium         *Medium        `gorm:"foreignKey:medium_id" json:"medium,omitempty"`
	Users          []User         `gorm:"many2many:space_users;" json:"users"`
	Roles          []SpaceRole    `gorm:"many2many:space_roles;" json:"roles"`
	Tokens         []SpaceToken   `json:"tokens"`
	Policy         []SpacePolicy  `json:"policies,omitempty"`
}

type SpaceToken struct {
	Base
	Name        string `gorm:"column:name" json:"name"`
	Description string `gorm:"column:description" json:"description"`
	SpaceID     uint   `gorm:"column:space_id" json:"space_id"`
	Space       *Space `gorm:"foreignKey:space_id" json:"application"`
	Token       string `gorm:"column:token" json:"token"`
}
