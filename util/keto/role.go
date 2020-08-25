package keto

import (
	"bytes"
	"encoding/json"
	"net/http"

	"github.com/factly/kavach-server/model"
)

// UpdateRole PUT Request to the keto server for policy
func UpdateRole(uri string, body *model.Role) error {
	buf := new(bytes.Buffer)
	json.NewEncoder(buf).Encode(&body)
	req, err := http.NewRequest("PUT", ketoURL+uri, buf)

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
