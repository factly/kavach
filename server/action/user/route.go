package user

import (
	"github.com/go-chi/chi"
)

// Router organisation
func Router() chi.Router {
	r := chi.NewRouter()

	r.Post("/checker", checker)
	r.Get("/application", list)
	r.Get("/space/{space_id}/getOrganisation", getOrganisation)

	return r
}
