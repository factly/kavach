package main

import (
	"net/http"

	"github.com/factly/identity/model"

	"github.com/factly/identity/action"
)

func main() {
	// db setup
	model.SetupDB()

	r := action.RegisterRoutes()
	http.ListenAndServe(":3000", r)
}
