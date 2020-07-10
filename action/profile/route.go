package profile

import (
	"github.com/go-chi/chi"
)

// Router organisation
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", detail)
	r.Put("/", update)
	return r
}
