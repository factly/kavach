package user

import (
	"github.com/go-chi/chi"
)

const namespace string = "applications"

// Router organisation
func Router() chi.Router {
	r := chi.NewRouter()

	r.Post("/", create)
	r.Get("/", list)
	r.Delete("/{user_id}", delete)

	return r
}
