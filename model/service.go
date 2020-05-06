package model

import (
	"github.com/jinzhu/gorm"
)

// Service model definition
type Service struct {
	gorm.Model
	Name string `gorm:"column:name" json:"name"`
}
