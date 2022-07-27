package keto

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/url"

	"github.com/factly/x/loggerx"
	"github.com/spf13/viper"
)

// ListObjectsBySubjectID function is used to list all the objects that user(subject) has access to by sending request to "/relation-tuples" endpoint in keto
// for more information - https://www.ory.sh/docs/keto/guides/list-api-display-objects
func ListObjectsBySubjectID(namespace, relation, subjectID string) ([]string, error) {
	//BUILDING THE URL TO SEND THE GET REQUEST TO /relation-tuples ENDPOINT TO KETO API
	baseURL, err := url.Parse(viper.GetString("keto_read_api_url"))
	if err != nil {
		return nil, err
	}
	// adding the path for the URL
	baseURL.Path += "relation-tuples"

	// adding the query parameters for the request
	params := url.Values{}
	if namespace != "" {
		params.Add("namespace", namespace)
	}
	if relation != "" {
		params.Add("relation", relation)
	}
	if subjectID == "" {
		return nil, errors.New("subjectID is a required field")
	} else {
		params.Add("subject_id", subjectID)
	}

	baseURL.RawQuery = params.Encode()

	// sending the get request to /relation-tuples
	req, err := http.NewRequest(http.MethodGet, baseURL.String(), nil)
	if err != nil {
		return nil, err
	}

	client := &http.Client{}
	response, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	responseBody := make(map[string]interface{})
	err = json.NewDecoder(response.Body).Decode(&responseBody)
	if err != nil {
		return nil, err
	}

	// if the response is not 200 OK then show the error message and throw the error
	if response.StatusCode != 200 {
		loggerx.Error(errors.New(responseBody["message"].(string)))
		return nil, errors.New("error in expanding the relation tuple")
	}
	// initialising objects array
	accessibleObjects := []string{}
	for _, eachRelationTuple := range responseBody["relation_tuples"].([]map[string]interface{}) {
		object, ok:= eachRelationTuple["object"].(string)
		if ok {
			accessibleObjects = append(accessibleObjects, object)
		}
	}
	return accessibleObjects, nil
}
