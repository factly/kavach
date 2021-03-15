package token

import "github.com/go-chi/chi"

type applicationToken struct {
	Name        string `json:"name,omitempty" validate:"required"`
	Description string `json:"description,omitempty"`
}

// Router organisation
func Router() chi.Router {
	r := chi.NewRouter()

	r.Post("/", create)
	r.Get("/", list)
	r.Delete("/{token_id}", delete)

	return r
}
