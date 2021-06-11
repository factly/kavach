package model

import (
	"encoding/json"
	"net/url"

	"github.com/jinzhu/gorm/dialects/postgres"
	"github.com/spf13/viper"
	"gorm.io/gorm"
)

// Medium model
type Medium struct {
	Base
	Name        string         `gorm:"column:name" json:"name"`
	Slug        string         `gorm:"column:slug" json:"slug"`
	Type        string         `gorm:"column:type" json:"type"`
	Title       string         `gorm:"column:title" json:"title"`
	Description string         `gorm:"column:description" json:"description"`
	Caption     string         `gorm:"column:caption" json:"caption"`
	AltText     string         `gorm:"column:alt_text" json:"alt_text"`
	FileSize    int64          `gorm:"column:file_size" json:"file_size"`
	URL         postgres.Jsonb `gorm:"column:url" json:"url" swaggertype:"primitive,string"`
	Dimensions  string         `gorm:"column:dimensions" json:"dimensions"`
	UserID      uint           `gorm:"column:user_id" json:"user_id"`
}

// TableName medium table name
func (Medium) TableName() string {
	return "media"
}

var mediumUser ContextKey = "medium_user"

// BeforeCreate hook
func (media *Medium) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(mediumUser)

	if userID == nil {
		return nil
	}
	uID := userID.(int)

	media.CreatedByID = uint(uID)
	media.UpdatedByID = uint(uID)
	return nil
}

// AfterCreate hook
func (media *Medium) AfterCreate(tx *gorm.DB) (err error) {
	resurl := map[string]interface{}{}
	if viper.IsSet("imageproxy_url") && media.URL.RawMessage != nil {
		_ = json.Unmarshal(media.URL.RawMessage, &resurl)
		if rawURL, found := resurl["raw"]; found {
			urlObj, _ := url.Parse(rawURL.(string))
			resurl["proxy"] = viper.GetString("imageproxy_url") + urlObj.Path

			rawBArr, _ := json.Marshal(resurl)
			media.URL = postgres.Jsonb{
				RawMessage: rawBArr,
			}
		}
	}
	return nil
}

// AfterFind hook
func (media *Medium) AfterFind(tx *gorm.DB) (err error) {
	resurl := map[string]interface{}{}
	if viper.IsSet("imageproxy_url") && media.URL.RawMessage != nil {
		_ = json.Unmarshal(media.URL.RawMessage, &resurl)
		if rawURL, found := resurl["raw"]; found {
			urlObj, _ := url.Parse(rawURL.(string))
			resurl["proxy"] = viper.GetString("imageproxy_url") + urlObj.Path

			rawBArr, _ := json.Marshal(resurl)
			media.URL = postgres.Jsonb{
				RawMessage: rawBArr,
			}
		}
	}
	return nil
}
