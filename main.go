package main

import (
	"net/http"
	"flag"
	"fmt"

	"github.com/factly/kavach-server/util/keto"
	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/action"
)

func main() {
	// db setup

	var dsn string
	var ketoURL string
	flag.StringVar(&dsn, "dsn", "", "Databse connection string")
	flag.StringVar(&ketoURL, "keto", "", "Keto connection string")
	
	flag.Parse()

	fmt.Println(dsn)
	fmt.Println(ketoURL)

	model.SetupDB(dsn)
	
	r := action.RegisterRoutes()

	keto.IsReady(ketoURL)

	http.ListenAndServe(":8000", r)
}
