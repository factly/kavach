package kratos

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/spf13/viper"
)

type identityTraits struct {
	Email string `json:"email"`
}

type createIdentityRequest struct {
	SchemaID string         `json:"schema_id"`
	Traits   identityTraits `json:"traits"`
}

func CreateKratosIdentity(email string) (string, error) {
	reqBody, err := json.Marshal(createIdentityRequest{
		SchemaID: "default",
		Traits:   identityTraits{Email: email},
	})
	if err != nil {
		return "", err
	}

	response, err := http.Post(viper.GetString("kratos_admin_url")+"/admin/identities", "application/json", bytes.NewReader(reqBody))
	if err != nil {
		return "", err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusCreated {
		return "", fmt.Errorf("kratos returned status %d while creating identity", response.StatusCode)
	}
	var identity struct {
		ID string `json:"id"`
	}
	err = json.NewDecoder(response.Body).Decode(&identity)
	if err != nil {
		return "", err
	}
	if identity.ID == "" {
		return "", fmt.Errorf("kratos returned an identity without an id")
	}
	return identity.ID, nil
}
