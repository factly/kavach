package user

import (
	"github.com/factly/kavach-server/model"
	"github.com/go-chi/chi"
)

var userContext model.ContextKey = "application_user"
const namespace string = "applications"
const orgNamespace string = "organisations"
// Router organisation
func Router() chi.Router {
	r := chi.NewRouter()

	r.Post("/", create)
	r.Get("/", list)
	r.Delete("/{user_id}", delete)

	return r
}
