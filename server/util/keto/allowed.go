package keto

import (
	"bytes"
	"encoding/json"
	"net/http"

	"github.com/factly/kavach-server/model"
	"github.com/spf13/viper"
)

func CheckKetoPermission(reqBody model.CheckKeto) (map[string]interface{}, error) {
	buf := new(bytes.Buffer)
	err := json.NewEncoder(buf).Encode(&reqBody)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequest("POST", viper.GetString("keto_url")+"/engines/acp/ory/regex/allowed", buf)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	response := make(map[string]interface{})
	err = json.NewDecoder(resp.Body).Decode(&response)
	if err != nil {
		return nil, err
	}
	return response, nil
}
