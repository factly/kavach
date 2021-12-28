package invite

import (
	"github.com/go-chi/chi"
)

// Router organisation
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", listInvitations)
	r.Delete("/{invite_id}", delete)
	r.Put("/{invite_id}", accept)
	return r
}
