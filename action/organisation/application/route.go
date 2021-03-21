package application

import (
	"github.com/factly/kavach-server/action/organisation/application/token"
	"github.com/factly/kavach-server/action/organisation/application/user"
	"github.com/factly/kavach-server/model"
	"github.com/go-chi/chi"
)

type application struct {
	Name        string `json:"name" validate:"required"`
	Slug        string `json:"slug" validate:"required"`
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
	r.Post("/default", defaults)
	r.Get("/{application_slug}/access", access)
	r.Route("/{application_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Put("/", update)
		r.Delete("/", delete)
		r.Mount("/tokens", token.Router())
		r.Mount("/users", user.Router())
	})

	return r
}
