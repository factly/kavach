package organisation

import (
	"github.com/factly/kavach-server/action/organisation/application"
	"github.com/factly/kavach-server/action/organisation/policy"
	"github.com/factly/kavach-server/action/organisation/roles"
	"github.com/factly/kavach-server/action/organisation/token"
	"github.com/factly/kavach-server/action/organisation/user"
	"github.com/factly/kavach-server/model"
	"github.com/go-chi/chi"
)

type orgWithRole struct {
	Organisation model.Organisation `json:"organisation"`
	Permission   model.OrganisationUser `json:"permission"`
	AllApplications []model.Application    `json:"applications,omitempty"`
}

var userContext model.ContextKey = "organisation_user"
const namespace string = "organisations"
// Router organisation
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/my", list)
	r.Post("/", create)
	// r.Get("/", all)
	r.Route("/{organisation_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Put("/", update)
		r.Delete("/", delete)
		r.Mount("/users", user.Router())
		r.Mount("/applications", application.Router())
		r.Mount("/tokens", token.Router())
		r.Mount("/roles", roles.Router())
		r.Mount("/policy", policy.Router())
	})

	return r
}
