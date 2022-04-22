package profile

import (
	"github.com/factly/kavach-server/action/profile/invite"
	"github.com/go-chi/chi"
)

// Router organisation
func Router() chi.Router {
	r := chi.NewRouter()
	r.Get("/details", profileDetail)
	r.Get("/", detail)
	r.Put("/", update)
	r.Mount("/invite", invite.Router())
	return r
}
