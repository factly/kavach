package keto

import (
	"bytes"
	"encoding/json"
	"net/http"
	"github.com/factly/kavach-server/model"
	"github.com/spf13/viper"
)

// UpdateRole PUT Request to the keto server for policy
func UpdateRole(uri string, body *model.Role) error {
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

// Get Role from keto server
func GetRole(uri, id string) (*model.Role, error) {
	req, err := http.NewRequest("GET", viper.GetString("keto_url")+"/"+uri, nil)

	if err != nil {
		return nil, err
	}

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return nil, err
	}

	role := &model.Role{}
	err = json.NewDecoder(resp.Body).Decode(&role)

	if err != nil {
		return nil, err
	}

	return role, nil
}

// Delete Role from keto server
func DeleteRole(uri, id string) error {
	req, err := http.NewRequest("DELETE", viper.GetString("keto_url")+uri+"/"+id, nil)

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
