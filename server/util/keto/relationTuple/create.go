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

// this function  creates a relation tuple (https://www.ory.sh/docs/keto/concepts/relation-tuples) in keto with a Subject ID
func CreateRelationTupleWithSubjectID(tuple *model.KetoRelationTupleWithSubjectID) error {
	buf := new(bytes.Buffer)
	err := json.NewEncoder(buf).Encode(&tuple)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("PUT", viper.GetString("keto_write_api_url")+"/relation-tuples", buf)
	if err != nil {
		return err
	}

	client := &http.Client{}
	response, err := client.Do(req)
	if err != nil {
		return err
	}
	if response.StatusCode != 201 {
		responseBody := make(map[string]interface{})
		err = json.NewDecoder(response.Body).Decode(&responseBody)
		if err != nil {
			return err
		}
		loggerx.Error(errors.New(responseBody["message"].(string)))
		return errors.New("error in creating the relation tuple")
	}
	return nil
}

// this function  creates a relation tuple (https://www.ory.sh/docs/keto/concepts/relation-tuples) in keto with a Subject ID
func CreateRelationTupleWithSubjectSet(tuple *model.KetoRelationTupleWithSubjectSet) error {
	buf := new(bytes.Buffer)
	err := json.NewEncoder(buf).Encode(&tuple)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("PUT", viper.GetString("keto_write_api_url")+"/relation-tuples", buf)
	if err != nil {
		return err
	}

	client := &http.Client{}
	response, err := client.Do(req)
	if err != nil {
		return err
	}
	if response.StatusCode != 201 {
		responseBody := make(map[string]interface{})
		err = json.NewDecoder(response.Body).Decode(&responseBody)
		if err != nil {
			return err
		}
		loggerx.Error(errors.New(responseBody["message"].(string)))
		return errors.New("error in creating the relation tuple")
	}
	return nil
}
