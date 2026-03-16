package model

import (
	"encoding/json"
	"fmt"
	"net/url"
	"strings"

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
	Space       *Space         `gorm:"foreignKey:MediumID" json:"space"`
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
		err = json.Unmarshal(media.URL.RawMessage, &resurl)
		if err != nil {
			return err
		}
		if rawURL, found := resurl["raw"]; found {
			urlObj, _ := url.Parse(rawURL.(string))
			bucket_name := ""
			if viper.IsSet("bucket_name") {
				bucket_name = fmt.Sprint(viper.GetString("bucket_name"), "/")
			}
			resurl["proxy"] = strings.Replace(viper.GetString("imageproxy_url")+urlObj.Path, bucket_name, "", 1)

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
		err = json.Unmarshal(media.URL.RawMessage, &resurl)
		if err != nil {
			return err
		}
		if rawURL, found := resurl["raw"]; found {
			urlObj, _ := url.Parse(rawURL.(string))
			bucket_name := ""
			if viper.IsSet("bucket_name") {
				bucket_name = fmt.Sprint(viper.GetString("bucket_name"), "/")
			}
			resurl["proxy"] = strings.Replace(viper.GetString("imageproxy_url")+urlObj.Path, bucket_name, "", 1)

			rawBArr, _ := json.Marshal(resurl)
			media.URL = postgres.Jsonb{
				RawMessage: rawBArr,
			}
		}
	}
	return nil
}
