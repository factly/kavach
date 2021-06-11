package keto

import (
	"net/http"

	"github.com/spf13/viper"
)

// IsReady checks the readiness of keto server
func IsReady() error {
	req, _ := http.NewRequest("GET", viper.GetString("keto_url")+"/health/ready", nil)

	client := &http.Client{}
	_, err := client.Do(req)

	if err != nil {
		return err
	}

	return nil
}
