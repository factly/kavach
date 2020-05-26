package main

import (
	"net/http"
	"os"

	"github.com/factly/identity/model"
	"github.com/joho/godotenv"

	"github.com/factly/identity/action"
)

func main() {
	godotenv.Load()

	port, ok := os.LookupEnv("PORT")
	if !ok {
		port = "6620"
	}
	port = ":" + port

	// db setup
	model.SetupDB()

	r := action.RegisterRoutes()
	http.ListenAndServe(port, r)
}
