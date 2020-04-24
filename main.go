package main

import (
	"net/http"

	"github.com/factly/identity/models"

	"github.com/factly/identity/actions"
)

func main() {
	// db setup
	models.SetupDB()

	r := actions.RegisterRoutes()
	http.ListenAndServe(":3000", r)
}
