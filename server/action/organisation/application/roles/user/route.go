package user

import (
	"github.com/go-chi/chi"
)

const namespace string = "applications"
// Router to manage users in different organisation roles
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)
	r.Post("/", create)
	r.Route("/{user_id}", func(r chi.Router) {
		r.Delete("/", delete)
	})

	return r
}
