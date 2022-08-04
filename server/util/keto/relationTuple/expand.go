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

// Expand function gives you all the subjects that have access on a particular object
// for more information -  - version - v0.8.0-alpha.2
func Expand(tuple *model.KetoSubjectSet) (map[string]interface{}, error) {
	// BUILDING THE URL TO SEND THE GET REQUEST TO /expand ENDPOINT TO KETO API
	baseURL, err := url.Parse(viper.GetString("keto_read_api_url"))
	if err != nil {
		return nil, err
	}

	// adding the path for the URL
	baseURL.Path += "relation-tuples/expand"

	// adding the query parameters for the request
	params := url.Values{}
	if tuple.Namespace == "" {
		return nil, errors.New("namespace is a required field")
	}
	if tuple.Object == "" {
		return nil, errors.New("object is a required field")
	}
	if tuple.Relation == "" {
		return nil, errors.New("relation is a required field")
	}

	baseURL.RawQuery = params.Encode()

	// sending the get request
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
	return responseBody, nil
}
