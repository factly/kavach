package space

import (
	"github.com/factly/kavach-server/action/organisation/application/space/user"
	"github.com/go-chi/chi"
)

// Router organisation
func Router() chi.Router {
	r := chi.NewRouter()

	r.Post("/", create)
	r.Get("/", list)
	r.Route("/{space_id}", func(r chi.Router) {
		r.Mount("/users", user.Router())
		r.Delete("/", delete)
		r.Put("/", update)
	})
	return r
}
