package model

import (
	"github.com/jinzhu/gorm/dialects/postgres"
)

// Space model
type Space struct {
	Base
	Name              string         `gorm:"column:name" json:"name"`
	Slug              string         `gorm:"column:slug" json:"slug"`
	SiteTitle         string         `gorm:"column:site_title" json:"site_title"`
	TagLine           string         `gorm:"column:tag_line" json:"tag_line"`
	Description       string         `gorm:"description" json:"description"`
	SiteAddress       string         `gorm:"column:site_address" json:"site_address"`
	LogoID            *uint          `gorm:"column:logo_id;default:NULL" json:"logo_id"`
	Logo              *Medium        `gorm:"foreignKey:logo_id" json:"logo"`
	LogoMobileID      *uint          `gorm:"column:logo_mobile_id;default:NULL" json:"logo_mobile_id"`
	LogoMobile        *Medium        `gorm:"foreignKey:logo_mobile_id" json:"logo_mobile"`
	FavIconID         *uint          `gorm:"column:fav_icon_id;default:NULL" json:"fav_icon_id"`
	FavIcon           *Medium        `gorm:"foreignKey:fav_icon_id" json:"fav_icon"`
	MobileIconID      *uint          `gorm:"column:mobile_icon_id;default:NULL" json:"mobile_icon_id"`
	MobileIcon        *Medium        `gorm:"foreignKey:mobile_icon_id" json:"mobile_icon"`
	VerificationCodes postgres.Jsonb `gorm:"column:verification_codes" json:"verification_codes" swaggertype:"primitive,string"`
	SocialMediaURLs   postgres.Jsonb `gorm:"column:social_media_urls" json:"social_media_urls" swaggertype:"primitive,string"`
	ContactInfo       postgres.Jsonb `gorm:"column:contact_info" json:"contact_info" swaggertype:"primitive,string"`
	Analytics         postgres.Jsonb `gorm:"column:analytics" json:"analytics" swaggertype:"primitive,string"`
	HeaderCode        string         `gorm:"column:header_code" json:"header_code"`
	FooterCode        string         `gorm:"column:footer_code" json:"footer_code"`
	MetaFields        postgres.Jsonb `gorm:"column:meta_fields" json:"meta_fields" swaggertype:"primitive,string"`
	OrganisationID    uint           `gorm:"column:organisation_id" json:"organisation_id"`
	Organisation      *Organisation  `gorm:"foreignKey:organisation_id" json:"organisation"`
	ApplicationID     uint           `gorm:"column:application_id" json:"application_id"`
	Application       *Application   `gorm:"foreignKey:application_id" json:"application"`
	Users             []User         `gorm:"many2many:space_users;" json:"users"`
	Roles             []SpaceRole    `gorm:"many2many:space_roles;" json:"roles"`
	Tokens            []SpaceToken   `json:"tokens"`
	Policy            []SpacePolicy  `json:"policies, omitempty"`
}

type SpaceToken struct {
	Base
	Name        string `gorm:"column:name" json:"name"`
	Description string `gorm:"column:description" json:"description"`
	SpaceID     uint   `gorm:"column:space_id" json:"space_id"`
	Space       *Space `gorm:"foreignKey:space_id" json:"application"`
	Token       string `gorm:"column:token" json:"token"`
}
