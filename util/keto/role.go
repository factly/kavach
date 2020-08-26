package keto

import (
	"bytes"
	"encoding/json"
	"net/http"

	"github.com/factly/kavach-server/config"
	"github.com/factly/kavach-server/model"
)

// UpdateRole PUT Request to the keto server for policy
func UpdateRole(uri string, body *model.Role) error {
	buf := new(bytes.Buffer)
	err := json.NewEncoder(buf).Encode(&body)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("PUT", config.KetoURL+uri, buf)

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
