package sessions

import "github.com/go-chi/chi"

func Router() chi.Router {
	r := chi.NewRouter()
	r.Get("/getActiveSessionsById", getActiveSessionsById)
	r.Delete("/revokeAllSessions", revokeAllSessions)
	r.Delete("/revokeSessionByID/{session_id}", revokeSessionByID)
	return r
}
