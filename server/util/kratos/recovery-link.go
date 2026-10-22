package kratos

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/spf13/viper"
)

type RecoveryResponse struct {
	RecoveryURL string `json:"recovery_link"`
	ExpiresAt   string `json:"expires_at"`
}

type recoveryLinkRequest struct {
	ExpiresIn  string `json:"expires_in"`
	IdentityID string `json:"identity_id"`
}

func CreateRecoveryLink(minTime string, id string) (*RecoveryResponse, error) {
	reqBody, err := json.Marshal(recoveryLinkRequest{
		ExpiresIn:  minTime,
		IdentityID: id,
	})
	if err != nil {
		return nil, err
	}
	response, err := http.Post(viper.GetString("kratos_admin_url")+"/admin/recovery/link", "application/json", bytes.NewReader(reqBody))
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("kratos returned status %d while creating recovery link", response.StatusCode)
	}
	var recoveryResponse RecoveryResponse
	err = json.NewDecoder(response.Body).Decode(&recoveryResponse)
	if err != nil {
		return nil, err
	}
	return &recoveryResponse, nil
}
