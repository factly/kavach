package keto

import (
	"errors"
	"log"
	"net/http"
	"os"

	"github.com/factly/kavach-server/util"
)

// IsReady checks the readiness of keto server
func IsReady() {
	req, _ := http.NewRequest("GET", os.Getenv("KETO_API")+"/health/ready", nil)

	client := &http.Client{}
	_, err := client.Do(req)

	if err != nil {
		util.LogError(errors.New("Cannot connect to Keto Server"))
		log.Fatal(err)
		return
	}
}
