package config

import (
	"log"

	"github.com/factly/x/loggerx"
	"github.com/spf13/viper"
)

// SetupVars setups all the config variables to run application
func SetupVars() {
	loggerx.Init()
	viper.AddConfigPath(".")
	viper.SetConfigName("config")
	viper.SetEnvPrefix("kavach")
	viper.AutomaticEnv()

	err := viper.ReadInConfig()
	if err != nil {
		loggerx.Info("config file not found...")
	}

	if Sqlite() {
		if !viper.IsSet("sqlite_db_path") {
			log.Fatal("please provide sqlite_db_path config param")
		}
	} else {
		if !viper.IsSet("database_host") {
			log.Fatal("please provide database_host config param")
		}
	
		if !viper.IsSet("database_user") {
			log.Fatal("please provide database_user config param")
		}
	
		if !viper.IsSet("database_name") {
			log.Fatal("please provide database_name config param")
		}
	
		if !viper.IsSet("database_password") {
			log.Fatal("please provide database_password config param")
		}
	
		if !viper.IsSet("database_port") {
			log.Fatal("please provide database_port config param")
		}
	
		if !viper.IsSet("database_ssl_mode") {
			log.Fatal("please provide database_ssl_mode config param")
		}	
	}

	if !viper.IsSet("domain_name") {
		log.Fatal("please provide domain name in config")
	}

	if !viper.IsSet("dynamic_from_email") {
		log.Fatal("please provide dynamic_from_email in config")
	}

	if !viper.IsSet("mande_host") {
		log.Fatal("please provide mande host in config")
	}

	if !viper.IsSet("dynamic_mande_template_id") {
		log.Fatal("please provide dynamic mande template id in config")
	}

	if !viper.IsSet("dynamic_sendgrid_api_key") {
		log.Fatal("please provide dynamic sendgrid api key in config")
	}

	if !viper.IsSet("kratos_admin_url") {
		log.Fatal("please provide kratos_admin_url in config")
	}

	if !viper.IsSet("kratos_public_url") {
		log.Fatal("please provide kratos_admin_url in config")
	}

	if !viper.IsSet("enable_multitenancy") {
		log.Fatal("please provide enable_multitenancy in config")
	}

	if !viper.IsSet("disable_registration") {
		log.Fatal("please provide disable_registration in config")
	}

	if !viper.IsSet("keto_write_api_url") {
		log.Fatal("please provide keto_write_api_url in config")
	}

	if !viper.IsSet("keto_read_api_url") {
		log.Fatal("please provide keto_read_api_url in config")
	}

}

func Sqlite() bool {
	return viper.IsSet("use_sqlite") && viper.GetBool("use_sqlite")
}
