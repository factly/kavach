package main

import (
	"log"
	"net/http"

	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/config"
	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/keto"
	"github.com/spf13/viper"
)

func main() {
	config.SetupVars()

	model.SetupDB(viper.GetString("postgres.dsn"))

	model.Migration()

	r := action.RegisterRoutes()

	keto.IsReady()

	err := http.ListenAndServe(":8000", r)
	if err != nil {
		log.Fatal(err)
	}
}
