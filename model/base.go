package model

import (
	"time"

	"gorm.io/gorm"
)

// Base with id, created_at, updated_at & deleted_at
type Base struct {
	ID        uint            `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
	DeletedAt *gorm.DeletedAt `gorm:"index" json:"deleted_at"`
}

// ContextKey
type ContextKey string
