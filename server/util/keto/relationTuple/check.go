package keto

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/loggerx"
	"github.com/spf13/viper"
)

func CheckKetoRelationTupleWithSubjectID(tuple *model.KetoRelationTupleWithSubjectID) (bool, error) {
	buf := new(bytes.Buffer)
	err := json.NewEncoder(buf).Encode(&tuple)
	if err != nil {
		return false, err
	}

	req, err := http.NewRequest("POST", viper.GetString("keto_read_api_url")+"/check", buf)
	if err != nil {
		return false, err
	}

	client := &http.Client{}
	response, err := client.Do(req)
	if err != nil {
		return false, err
	}

	responseBody := make(map[string]interface{})
	err = json.NewDecoder(response.Body).Decode(&responseBody)
	if err != nil {
		return false, err
	}
	if response.StatusCode != 200 {
		loggerx.Error(errors.New(responseBody["message"].(string)))
		return false, errors.New("error in checking the authorization the relation tuple")
	}
	return responseBody["allowed"].(bool), nil
}

func CheckKetoRelationTupleWithSubjectSet(tuple *model.KetoRelationTupleWithSubjectSet) (bool, error) {
	buf := new(bytes.Buffer)
	err := json.NewEncoder(buf).Encode(&tuple)
	if err != nil {
		return false, err
	}

	req, err := http.NewRequest("POST", viper.GetString("keto_read_api_url")+"/check", buf)
	if err != nil {
		return false, err
	}

	client := &http.Client{}
	response, err := client.Do(req)
	if err != nil {
		return false, err
	}
	responseBody := make(map[string]interface{})
	err = json.NewDecoder(response.Body).Decode(&responseBody)
	if err != nil {
		return false, err
	}
	if response.StatusCode != 200 {
		loggerx.Error(errors.New(responseBody["message"].(string)))
		return false, errors.New("error in checking the authorization the relation tuple")
	}

	return responseBody["allowed"].(bool), nil
}
