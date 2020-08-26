package main

import (
	"fmt"
	"net/http"

	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/config"
	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/keto"
)

func main() {
	config.SetupVars()

	fmt.Println(config.DSN)
	fmt.Println(config.KetoURL)

	model.SetupDB()

	r := action.RegisterRoutes()

	keto.IsReady()

	http.ListenAndServe(":8000", r)
}
