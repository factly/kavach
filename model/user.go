package model

import (
	"github.com/jinzhu/gorm"
)

// User model definition
type User struct {
	gorm.Model
	Email     string `gorm:"column:email;unique_index" json:"email"`
	KID       string `gorm:"column:kid;" json:"kid"`
	FirstName string `gorm:"column:first_name" json:"first_name"`
	LastName  string `gorm:"column:last_name" json:"last_name"`
}
