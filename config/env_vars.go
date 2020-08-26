package config

import "flag"

// DSN dsn
var DSN string = "postgres://postgres:postgres@localhost:5432/kavach?sslmode=disable"

// KetoURL keto server url
var KetoURL string = "http://keto.com"

// SetupVars setups all the config variables to run application
func SetupVars() {
	var dsn string
	var ketoURL string
	flag.StringVar(&dsn, "dsn", "", "Databse connection string")
	flag.StringVar(&ketoURL, "keto", "", "Keto connection string")
	flag.Parse()

	if dsn != "" {
		DSN = dsn
	}

	if ketoURL != "" {
		KetoURL = ketoURL
	}
}
