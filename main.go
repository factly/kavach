package main

import (
	"log"
	"net/http"

	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/config"
	_ "github.com/factly/kavach-server/docs"
	"github.com/factly/kavach-server/model"
	"github.com/go-chi/chi"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

// @title Kavach Server API
// @version 1.0
// @description Kavach Server API

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:5000
// @BasePath /
func main() {
	config.SetupVars()

	model.SetupDB()

	model.Migration()

	r := action.RegisterRoutes()

	go func() {
		promRouter := chi.NewRouter()
		promRouter.Mount("/metrics", promhttp.Handler())
		log.Fatal(http.ListenAndServe(":8001", promRouter))
	}()

	err := http.ListenAndServe(":8000", r)
	if err != nil {
		log.Fatal(err)
	}
}
