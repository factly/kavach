package roles

import (
	"github.com/factly/kavach-server/action/organisation/roles/user"
	"github.com/go-chi/chi"
)

const namespace string = "organisations"
// Organisation Role Router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)
	r.Post("/", create)
	r.Route("/{role_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Delete("/", delete)
		r.Put("/", update) 
		r.Mount("/users", user.Router())
	})

	return r
}
