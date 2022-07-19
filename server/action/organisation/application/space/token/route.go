package token

import (
	"github.com/factly/kavach-server/model"
	"github.com/go-chi/chi"
)

type spaceToken struct {
	model.Base
	Name        string       `gorm:"column:name" json:"name"`
	Description string       `gorm:"column:description" json:"description"`
	SpaceID     uint         `gorm:"column:space_id" json:"space_id"`
	Space       *model.Space `gorm:"foreignKey:space_id" json:"application"`
}

func Router() chi.Router {
	r := chi.NewRouter()
	r.Get("/", list)
	r.Post("/", create)
	r.Delete("/{token_id}", delete)

	return r
}
