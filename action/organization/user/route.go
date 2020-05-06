package user

import (
	"github.com/go-chi/chi"
)

// Router organization
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)

	return r
}
