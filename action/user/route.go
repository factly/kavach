package user

import (
	"github.com/go-chi/chi"
)

// Router organisation
func Router() chi.Router {
	r := chi.NewRouter()

	r.Post("/checker", checker)
	r.Get("/application", list)

	return r
}
