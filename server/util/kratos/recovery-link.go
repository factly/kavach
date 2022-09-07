package kratos

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"github.com/spf13/viper"
)

type RecoveryResponse struct{
	RecoveryURL string `json:"recovery_link"`
	ExpiresAt string `json:"expires_at"`
}

func CreateRecoveryLink(minTime string, id string)(*RecoveryResponse ,error){
	requestBody := fmt.Sprintf(`
	{
	"expires_in": "%s",
	"identity_id": "%s"
  	}`, minTime, id)
	req := strings.NewReader(requestBody)
	response, err := http.Post(viper.GetString("kratos_admin_url")+"/recovery/link", "application/json", req)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()
	var recoveryResponse RecoveryResponse
	err = json.NewDecoder(response.Body).Decode(&recoveryResponse)
	if err != nil {
		return nil, err
	}
	return &recoveryResponse, nil
}