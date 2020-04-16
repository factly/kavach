package models

import (
	"net/url"

	"github.com/jinzhu/gorm"
)

// Service model definition
type Service struct {
	gorm.Model
	Name string `gorm:"column:name" json:"name"`
}

// Validate the Service schema
func (s *Service) Validate() url.Values {
	errs := url.Values{}

	if s.Name == "" {
		errs.Add("Name", "Name is required")
	}

	return errs
}
