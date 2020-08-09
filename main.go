package main

import (
	"net/http"

	"github.com/factly/kavach-server/util/keto"

	"github.com/factly/kavach-server/model"
	"github.com/joho/godotenv"

	"github.com/factly/kavach-server/action"
)

func main() {
	godotenv.Load()

	// db setup
	model.SetupDB()

	r := action.RegisterRoutes()

	keto.IsReady()

	http.ListenAndServe(":8000", r)
}
