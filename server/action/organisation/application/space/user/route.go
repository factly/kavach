package user

import (
	"github.com/factly/kavach-server/model"
	"github.com/go-chi/chi"
)

var userContext model.ContextKey = "user"

// Router space/user
func Router() chi.Router {
	r := chi.NewRouter()
	r.Post("/", create)
	r.Get("/", list)
	r.Delete("/{user_id}", delete)
	return r
}
