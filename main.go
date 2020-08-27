package main

import (
	"log"
	"net/http"

	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/config"
	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/keto"
)

func main() {
	config.SetupVars()

	model.SetupDB(config.DSN)

	model.Migration()

	r := action.RegisterRoutes()

	keto.IsReady()

	err := http.ListenAndServe(":8000", r)
	if err != nil {
		log.Fatal(err)
	}
}
