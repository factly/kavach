package models

import (
	"net/url"

	"github.com/jinzhu/gorm"
)

// User model definition
type User struct {
	gorm.Model
	Email     string `gorm:"column:email" json:"email"`
	KID       string `gorm:"column:kid" json:"kid"`
	FirstName string `gorm:"column:first_name" json:"first_name"`
	LastName  string `gorm:"column:last_name" json:"last_name"`
}

// Validate the User schema
func (u *User) Validate() url.Values {
	errs := url.Values{}
	if u.Email == "" {
		errs.Add("email", "Email is required")
	}
	return errs
}
