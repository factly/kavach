package space

import "github.com/go-chi/chi"

// Router organisation
func Router() chi.Router {
	r := chi.NewRouter()

	r.Post("/", create)
	r.Get("/", list)
	r.Delete("/{space_id}", delete)
	r.Put("/{space_id}", update)
	return r
}
