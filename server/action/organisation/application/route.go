package application

import (
	"github.com/factly/kavach-server/action/organisation/application/policy"
	"github.com/factly/kavach-server/action/organisation/application/roles"
	"github.com/factly/kavach-server/action/organisation/application/space"
	"github.com/factly/kavach-server/action/organisation/application/token"
	"github.com/factly/kavach-server/action/organisation/application/user"
	"github.com/factly/kavach-server/model"
	"github.com/go-chi/chi"
)

type application struct {
	Name        string `json:"name" validate:"required"`
	Slug        string `json:"slug" validate:"required"`
	Description string `json:"description"`
	MediumID    uint   `json:"medium_id"`
	URL         string `json:"url" validate:"required"`
	IsDefault   bool   `json:"is_default"`
}

var userContext model.ContextKey = "application_user"

const namespace string = "applications"
const orgNamespace string = "organisations"

// Router organisation
func Router() chi.Router {
	r := chi.NewRouter()

	r.Post("/", create)
	r.Get("/", list)
	r.Get("/default", listDefault)
	r.Post("/token/validate", validate_token)
	r.Get("/{application_slug}/access", access)
	r.Route("/{application_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Put("/", update)
		r.Post("/default", addDefault)
		r.Delete("/default", deleteDefault)
		r.Delete("/", delete)
		r.Mount("/tokens", token.Router())
		r.Mount("/users", user.Router())
		r.Mount("/spaces", space.Router())
		r.Mount("/roles", roles.Router())
		r.Mount("/policy", policy.Router())
	})

	return r
}
