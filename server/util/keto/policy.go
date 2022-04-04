package keto

import (
	"bytes"
	"encoding/json"
	"net/http"

	"github.com/factly/kavach-server/model"
	"github.com/spf13/viper"
)

// KetoGetRequest does get request to keto with empty body
func GetPolicy(path string) (*model.Policy, error) {
	req, err := http.NewRequest("GET", viper.GetString("keto_url")+path, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	policy := &model.Policy{}
	err = json.NewDecoder(resp.Body).Decode(policy)
	if err != nil {
		return nil, err
	}
	return policy, nil
}

// UpdatePolicy PUT request to keto server to update the policy
func UpdatePolicy(uri string, body *model.Policy) error {
	buf := new(bytes.Buffer)
	err := json.NewEncoder(buf).Encode(&body)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("PUT", viper.GetString("keto_url")+uri, buf)

	if err != nil {
		return err
	}

	client := &http.Client{}
	_, err = client.Do(req)

	if err != nil {
		return err
	}
	return nil
}

// Delete DELETE request to keto server to delete resource
func Delete(uri string) error {
	req, err := http.NewRequest("DELETE", viper.GetString("keto_url")+uri, nil)

	if err != nil {
		return err
	}

	client := &http.Client{}
	_, err = client.Do(req)

	if err != nil {
		return err
	}
	return nil
}

//DeletePolicy is used to delete the policy from keto
func DeletePolicy(uri string) error {
	req, err := http.NewRequest("DELETE", viper.GetString("keto_url")+uri, nil)

	if err != nil {
		return err
	}

	client := &http.Client{}
	_, err = client.Do(req)

	if err != nil {
		return err
	}
	return nil
}
