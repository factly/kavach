package keto

import (
	"log"
	"net/http"
	"os"
)

// IsReady checks the readiness of keto server
func IsReady() {
	req, _ := http.NewRequest("GET", os.Getenv("KETO_API")+"/health/ready", nil)

	client := &http.Client{}
	_, err := client.Do(req)

	if err != nil {
		log.Fatal(err)
		return
	}
}
