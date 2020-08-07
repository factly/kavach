package action

import (
	"net/http"
	"os"

	"github.com/factly/kavach-server/util"

	"github.com/factly/kavach-server/action/organisation"
	"github.com/factly/kavach-server/action/profile"
	"github.com/factly/kavach-server/action/user"
	"github.com/factly/x/loggerx"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/cors"
)

// RegisterRoutes - CRUD servies
func RegisterRoutes() http.Handler {

	// open log file
	file, err := os.OpenFile("logrus.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)

	r := chi.NewRouter()

	r.Use(middleware.RequestID)

	r.Use(util.ErrorLogger(file))
	if err == nil {
		r.Use(loggerx.NewLogger(file))
	}
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Heartbeat("/ping"))

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

	r.Mount("/organisations", organisation.Router())
	r.Mount("/users", user.Router())
	r.Mount("/profile", profile.Router())

	return r
}
