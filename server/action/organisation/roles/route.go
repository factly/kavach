package roles

import (
	"github.com/go-chi/chi"
)

// Organisation Role Router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)
	r.Post("/", create)
	r.Route("/{role_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Delete("/", delete)
		r.Put("/", update) // needed discussion on whether there should be update role or not
	})

	return r
}
