package keto

import (
	"log"
	"net/http"
)

var keto string

// IsReady checks the readiness of keto server
func IsReady(ketoURL string) {
	keto = ketoURL
	req, _ := http.NewRequest("GET", keto+"/health/ready", nil)

	client := &http.Client{}
	_, err := client.Do(req)

	if err != nil {
		log.Fatal(err)
		return
	}
}
