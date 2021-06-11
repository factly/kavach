package action

import (
	"log"
	"net/http"

	"github.com/factly/kavach-server/util/keto"
	"github.com/factly/x/healthx"

	"github.com/factly/kavach-server/action/medium"
	"github.com/factly/kavach-server/action/organisation"
	"github.com/factly/kavach-server/action/organisation/application/token"
	"github.com/factly/kavach-server/action/profile"
	"github.com/factly/kavach-server/action/user"
	"github.com/factly/kavach-server/model"
	"github.com/factly/x/loggerx"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/spf13/viper"
	httpSwagger "github.com/swaggo/http-swagger"
)

// RegisterRoutes - CRUD servies
func RegisterRoutes() http.Handler {

	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(loggerx.Init())
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Heartbeat("/ping"))

	//r.Use(util.GormRequestID)

	if viper.IsSet("mode") && viper.GetString("mode") == "development" {
		r.Get("/swagger/*", httpSwagger.WrapHandler)
		log.Printf("Swagger @ http://localhost:5000/swagger/index.html")
	}

	r.Mount("/organisations", organisation.Router())
	r.Mount("/users", user.Router())
	r.Mount("/profile", profile.Router())
	r.Mount("/media", medium.Router())
	r.Post("/applications/{application_slug}/validateToken", token.Validate)

	sqlDB, _ := model.DB.DB()

	healthx.RegisterRoutes(r, healthx.ReadyCheckers{
		"keto":     keto.IsReady,
		"database": sqlDB.Ping,
	})

	return r
}
