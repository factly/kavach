package organization

import (
	"github.com/factly/identity/action/organization/user"
	"github.com/go-chi/chi"
)

// Router organization
func Router() chi.Router {
	r := chi.NewRouter()

	r.Route("/organizations", func(r chi.Router) {
		r.Post("/", create)
		r.Get("/", list)
		r.Route("/{organization_id}", func(r chi.Router) {
			r.Delete("/", delete)
			r.Get("/", details)
			r.Mount("/users", user.Router())
		})
	})

	return r
}
