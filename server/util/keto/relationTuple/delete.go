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
	baseURL.Path += "admin/relation-tuples"

	// add Query Parameters
	params := url.Values{}
	// adding the query parameters only when they have some value, if it is an empty string then the query parameters is not added
	if tuple.Namespace != "" {
		params.Add("namespace", tuple.Namespace)
	}
	if tuple.Object != "" {
		params.Add("object", tuple.Object)
	}
	if tuple.Relation != "" {
		params.Add("relation", tuple.Relation)
	}
	if tuple.SubjectID != "" {
		params.Add("subject_id", tuple.SubjectID)
	}
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
	baseURL.Path += "admin/relation-tuples"

	// add Query Parameters
	params := url.Values{}
	if tuple.Namespace != "" {
		params.Add("namespace", tuple.Namespace)
	}
	if tuple.Object != "" {
		params.Add("object", tuple.Object)
	}
	if tuple.Relation != "" {
		params.Add("relation", tuple.Relation)
	}
	if tuple.SubjectSet.Namespace != "" {
		params.Add("subject_space.namespace", tuple.SubjectSet.Namespace)
	}
	if tuple.SubjectSet.Object != "" {
		params.Add("subject_space.object", tuple.SubjectSet.Object)
	}
	if tuple.SubjectSet.Relation != "" {
		params.Add("subject_space.relation", tuple.SubjectSet.Relation)
	}
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
