package space

import (
	"github.com/factly/kavach-server/action/organisation/application/space/roles"
	"github.com/factly/kavach-server/action/organisation/application/space/token"
	"github.com/factly/kavach-server/action/organisation/application/space/user"
	"github.com/factly/kavach-server/action/organisation/application/space/policy"
	"github.com/go-chi/chi"
)

const namespace string = "spaces"
const appNamespace string = "applications"
// Router organisation
func Router() chi.Router {
	r := chi.NewRouter()

	r.Post("/", create)
	r.Get("/", list)
	r.Route("/{space_id}", func(r chi.Router) {
		r.Mount("/users", user.Router())
		r.Delete("/", delete)
		r.Put("/", update)
		r.Get("/", details)
		r.Mount("/tokens", token.Router())
		r.Mount("/roles", roles.Router())
		r.Mount("/policy", policy.Router())
	})
	return r
}
