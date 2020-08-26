package keto

import (
	"log"
	"net/http"

	"github.com/factly/kavach-server/config"
)

// IsReady checks the readiness of keto server
func IsReady() {
	req, _ := http.NewRequest("GET", config.KetoURL+"/health/ready", nil)

	client := &http.Client{}
	_, err := client.Do(req)

	if err != nil {
		log.Fatal(err)
		return
	}
}
