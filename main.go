package main

import (
	"log"
	"net/http"
	"os"

	"github.com/factly/identity/model"
	"github.com/joho/godotenv"

	"github.com/factly/identity/action"
)

func main() {
	err := godotenv.Load()

	if err != nil {
		log.Fatal("error loding .env file")
	}

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
