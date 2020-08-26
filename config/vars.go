package config

import (
	"flag"
	"log"
)

// DSN dsn
var DSN string

// KetoURL keto server url
var KetoURL string

// SetupVars setups all the config variables to run application
func SetupVars() {
	var dsn string
	var ketoURL string
	flag.StringVar(&dsn, "dsn", "", "Database connection string")
	flag.StringVar(&ketoURL, "keto", "", "Keto connection string")
	flag.Parse()

	if dsn == "" {
		log.Fatal("Please pass dsn flag")
	}

	if ketoURL == "" {
		log.Fatal("Please pass keto flag")
	}

	DSN = dsn
	KetoURL = ketoURL
}
