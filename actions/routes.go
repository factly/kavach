package actions

import (
	"net/http"

	"github.com/go-chi/chi"
	"github.com/go-chi/cors"
)

// RegisterRoutes - CRUD servies
func RegisterRoutes() http.Handler {
	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		// AllowedOrigins: []string{"https://foo.com"}, // Use this to allow specific origin hosts
		AllowedOrigins: []string{"*"},
		// AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	r.Route("/organizations", func(r chi.Router) {
		r.Post("/", CreateOrganization)
		r.Get("/", GetOrganizations)
		r.Route("/{id}", func(r chi.Router) {
			r.Delete("/", DeleteOrganization)
		})
	})

	return r
}
