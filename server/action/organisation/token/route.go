package token

import (
	"github.com/go-chi/chi"
)

func Router() chi.Router {
	r := chi.NewRouter()
	r.Get("/", list)
	r.Post("/", create)
	r.Delete("/{token_id}", delete)

	return r
}
