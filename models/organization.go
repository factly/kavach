package models

import (
	"net/url"

	"github.com/jinzhu/gorm"
)

// Organization model definition
type Organization struct {
	gorm.Model
	Title string `gorm:"column:title" json:"title"`
	Slug  string `gorm:"column:slug;unique_index" json:"slug"`
}

// Validate the Organization schema
func (o *Organization) Validate() url.Values {
	errs := url.Values{}

	if o.Title == "" {
		errs.Add("Title", "Title field is required!")
	}
	if o.Slug == "" {
		errs.Add("Slug", "Slug field is required!")
	}
	return errs
}
