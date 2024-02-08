package token

import (
	"github.com/factly/kavach-server/model"
	"github.com/go-chi/chi"
)

type organisationToken struct {
	model.Base
	Name           string              `gorm:"column:name" json:"name"`
	Description    string              `gorm:"column:description" json:"description"`
	OrganisationID uint                `gorm:"column:organisation_id" json:"organisation_id"`
	Organisation   *model.Organisation `gorm:"foreignKey:organisation_id" json:"organisation"`
}

func Router() chi.Router {
	r := chi.NewRouter()
	r.Get("/", list)
	r.Post("/", create)
	r.Delete("/{token_id}", delete)
	r.Post("/validate", validate)

	return r
}
