package profile

import (
	"github.com/go-chi/chi"
)

// Router organization
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", detail)
	r.Put("/", update)
	return r
}
