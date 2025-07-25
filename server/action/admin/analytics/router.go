package analytics

import "github.com/go-chi/chi"

func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/users", details)

	return r
}
