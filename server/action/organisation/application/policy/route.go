package policy

import (
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

type policyReq struct {
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Slug        string         `json:"slug"`
	Permissions postgres.Jsonb `json:"permissions"`
	Roles       []uint         `json:"roles"`
}

type permission struct {
	Resource string   `json:"resource"`
	Actions  []string `json:"actions"`
}

// Organisation Role Router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)
	r.Post("/", create)
	r.Post("/allowed", allowed)
	r.Route("/{policy_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Delete("/", delete)
		r.Put("/", update)
	})

	return r
}
