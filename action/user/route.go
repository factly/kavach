package user

import (
	"github.com/go-chi/chi"
)

// Router organization
func Router() chi.Router {
	r := chi.NewRouter()

	r.Route("/", func(r chi.Router) {
		r.Post("/checker", checker)
		r.Get("/", list)
	})

	return r
}
