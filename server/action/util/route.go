package util

import (
	"github.com/go-chi/chi"
)

// Router organisation
func Router() chi.Router {
	r := chi.NewRouter()
	r.Get("/space/{space_id}/getOrganisation", getOrganisation)
	r.Get("/application/{application_slug}", getApplication)
	return r
}
