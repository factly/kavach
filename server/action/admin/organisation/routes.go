package organisation

import (
	"github.com/factly/kavach-server/model"
	"github.com/go-chi/chi"
)

var userContext model.ContextKey = "organisation_user"

// Router organisation
func Router() chi.Router {
	r := chi.NewRouter()

	r.Post("/", create)
	r.Get("/", list)
	r.Route("/{organisation_id}", func(r chi.Router) {
		r.Put("/", update)
		r.Get("/", details)
	})

	return r
}
