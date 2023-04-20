package user

import "github.com/go-chi/chi"

// user - user payload
type user struct {
	Email       string `json:"email"`
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	DisplayName string `json:"display_name"`
	Gender      string `json:"gender"`
	Password    string `json:"password"`
}

// AdminRouter user
func Router() chi.Router {
	r := chi.NewRouter()

	r.Post("/", create)
	r.Get("/", list)

	return r
}
