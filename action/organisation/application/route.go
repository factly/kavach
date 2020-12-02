package application

import (
	"github.com/factly/kavach-server/model"
	"github.com/go-chi/chi"
)

type application struct {
	Name        string `json:"name" validate:"required"`
	Description string `json:"description"`
	MediumID    uint   `json:"medium_id"`
	URL         string `json:"url" validate:"required"`
}

var userContext model.ContextKey = "application_user"

// Router organisation
func Router() chi.Router {
	r := chi.NewRouter()

	r.Post("/", create)
	r.Get("/", list)
	r.Route("/{application_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Put("/", update)
		r.Delete("/", delete)
	})

	return r
}
