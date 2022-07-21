package keto

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/url"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/loggerx"
	"github.com/spf13/viper"
)

func DeleteRelationTupleWithSubjectID(tuple *model.KetoRelationTupleWithSubjectID) error {
	// BUILDING THE URL TO SEND THE DELETE REQUEST TO KETO API
	baseURL, err := url.Parse(viper.GetString("keto_write_api_url"))
	if err != nil {
		return err
	}

	//adding the path
	baseURL.Path += "relation-tuples"

	// add Query Parameters
	params := url.Values{}
	params.Add("namespace", tuple.Namespace)
	params.Add("object", tuple.Object)
	params.Add("relation", tuple.Relation)
	params.Add("subject_id", tuple.SubjectID)
	baseURL.RawQuery = params.Encode()

	// sending a delete request to keto api to delete the relation tuple
	req, err := http.NewRequest(http.MethodDelete, baseURL.String(), nil)
	if err != nil {
		return err
	}

	client := &http.Client{}
	response, err := client.Do(req)
	if err != nil {
		return err
	}

	if !(response.StatusCode == 201 || response.StatusCode == 204) {
		responseBody := make(map[string]interface{})
		err = json.NewDecoder(response.Body).Decode(&responseBody)
		if err != nil {
			return err
		}
		loggerx.Error(errors.New(responseBody["message"].(string)))
		return errors.New("error in deleting the relation tuple")
	}
	return nil
}

func DeleteRelationTupleWithSubjectSet(tuple *model.KetoRelationTupleWithSubjectSet) error {
	// BUILDING THE URL TO SEND THE DELETE REQUEST TO KETO API
	baseURL, err := url.Parse(viper.GetString("keto_write_api_url"))
	if err != nil {
		return err
	}

	//adding the path
	baseURL.Path += "relation-tuples"

	// add Query Parameters
	params := url.Values{}
	params.Add("namespace", tuple.Namespace)
	params.Add("object", tuple.Object)
	params.Add("relation", tuple.Relation)
	params.Add("subject_set.namespace", tuple.SubjectSet.Namespace)
	params.Add("subject_set.object", tuple.SubjectSet.Object)
	params.Add("subject_set.relation", tuple.SubjectSet.Relation)
	baseURL.RawQuery = params.Encode()

	// sending a delete request to keto api to delete the relation tuple
	req, err := http.NewRequest(http.MethodDelete, baseURL.String(), nil)
	if err != nil {
		return err
	}

	client := &http.Client{}
	response, err := client.Do(req)
	if err != nil {
		return err
	}

	if !(response.StatusCode == 201 || response.StatusCode == 204) {
		responseBody := make(map[string]interface{})
		err = json.NewDecoder(response.Body).Decode(&responseBody)
		if err != nil {
			return err
		}
		loggerx.Error(errors.New(responseBody["message"].(string)))
		return errors.New("error in deleting the relation tuple")
	}
	return nil
}
