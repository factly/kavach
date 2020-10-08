package keto

import (
	"log"
	"net/http"

	"github.com/spf13/viper"
)

// IsReady checks the readiness of keto server
func IsReady() {
	req, _ := http.NewRequest("GET", viper.GetString("keto.url")+"/health/ready", nil)

	client := &http.Client{}
	_, err := client.Do(req)

	if err != nil {
		log.Fatal(err)
		return
	}
}
