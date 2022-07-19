package token

import (
	"github.com/factly/kavach-server/model"
	"github.com/go-chi/chi"
)

type createAppToken struct {
	Name        string `json:"name,omitempty" validate:"required"`
	Description string `json:"description,omitempty"`
}

type applicationToken struct {
	model.Base
	Name          string             `gorm:"column:name" json:"name"`
	Description   string             `gorm:"column:description" json:"description"`
	ApplicationID *uint              `gorm:"column:application_id" json:"application_id"`
	Application   *model.Application `gorm:"foreignKey:application_id" json:"application"`
}

// Router organisation
func Router() chi.Router {
	r := chi.NewRouter()

	r.Post("/", create)
	r.Get("/", list)
	r.Delete("/{token_id}", delete)

	return r
}
