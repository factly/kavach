package user

import (
	"github.com/go-chi/chi"
)

// Router organization
func Router() chi.Router {
	r := chi.NewRouter()

	r.Route("/", func(r chi.Router) {
		r.Get("/", list)
		r.Post("/checker", checker)
	})

	return r
}
