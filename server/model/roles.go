package model

type OrganisationRole struct {
	Base
	Name           string        `gorm:"column:name" json:"name"`
	Description    string        `gorm:"column:description" json:"description"`
	Slug           string        `gorm:"column:slug" json:"slug"`
	OrganisationID uint          `gorm:"column:organisation_id" json:"organisation_id"`
	Organisation   *Organisation `gorm:"foreignKey:organisation_id" json:"organisation,omitempty"`
	Users          []User        `gorm:"many2many:organisation_roles_users;" json:"users"`
}

type ApplicationRole struct {
	Base
	Name           string        `gorm:"column:name" json:"name"`
	Description    string        `gorm:"column:description" json:"description"`
	Slug           string        `gorm:"column:slug" json:"slug"`
	ApplicationID  uint          `gorm:"column:application_id" json:"application_id"`
	Application    *Application  `gorm:"foreignKey:application_id" json:"application,omitempty"`
	OrganisationID uint          `gorm:"column:organisation_id" json:"organisation_id"`
	Organisation   *Organisation `gorm:"foreignKey:organisation_id" json:"organisation"`
	Users          []User        `gorm:"many2many:application_roles_users;" json:"users"`
}

type SpaceRole struct {
	Base
	Name        string `gorm:"column:name" json:"name"`
	Description string `gorm:"column:description" json:"description"`
	Slug        string `gorm:"column:slug" json:"slug"`
	SpaceID     uint   `gorm:"column:space_id" json:"space_id"`
	Space       *Space `gorm:"foreignKey:space_id" json:"space,omitempty"`
	Users       []User `gorm:"many2many:space_roles_users;" json:"users"`
}
