package config

import (
	"log"

	"github.com/spf13/viper"
)

// SetupVars setups all the config variables to run application
func SetupVars() {
	viper.AddConfigPath(".")
	viper.SetConfigName("config")
	viper.AutomaticEnv()

	err := viper.ReadInConfig()
	if err != nil {
		log.Println("config file not found...")
	}

	if !viper.IsSet("dsn") {
		log.Fatal("please provide dsn in config")
	}

	if !viper.IsSet("keto_url") {
		log.Fatal("please provide keto_url in config")
	}
}
