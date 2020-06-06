package organization

import (
	"github.com/factly/kavach-server/action/organization/user"
	"github.com/factly/kavach-server/model"
	"github.com/go-chi/chi"
)

type orgWithRole struct {
	model.Organization
	Permission model.OrganizationUser `json:"permission"`
}

// Router organization
func Router() chi.Router {
	r := chi.NewRouter()

	r.Route("/", func(r chi.Router) {
		r.Get("/my", list)
		r.Post("/", create)
		r.Route("/{organization_id}", func(r chi.Router) {
			r.Get("/", details)
			r.Put("/", update)
			r.Delete("/", delete)
			r.Mount("/users", user.Router())
		})
	})

	return r
}
