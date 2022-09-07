package keto

import (
	"errors"
	"net/http"
	"net/url"

	customHTTP "github.com/factly/kavach-server/util/http"
	"github.com/factly/x/loggerx"
	"github.com/spf13/viper"
)

//ListSubjectsByObjectID returns the array of subject_id which have access on a particular object
// for more information -
func ListSubjectsByObjectID(namespace, relation, object_id string) ([]string, error) {
	//BUILDING THE URL TO SEND THE HTTP GET REQUEST TO /relation-tuples ENDPOINT TO KETO-API
	baseURL, err := url.Parse(viper.GetString("keto_read_api_url"))
	if err != nil {
		return nil, err
	}
	// adding the path for the url
	baseURL.Path += "relation-tuples"

	// adding the query parameters for the request
	params := url.Values{}
	if namespace != "" {
		params.Add("namespace", namespace)
	}
	if relation != "" {
		params.Add("relation", relation)
	}
	if object_id == "" {
		return nil, errors.New("object_id is a required field")
	} else {
		params.Add("object", object_id)
	}
	baseURL.RawQuery = params.Encode()

	statusCode, respBody, err := customHTTP.SendRequest(http.MethodGet, baseURL.String(), nil)
	if err != nil {
		return nil, err
	}
	if statusCode != 200 {
		loggerx.Error(errors.New(respBody["message"].(string)))
		return nil, errors.New("error in expanding the relation tuple")
	}
	// initialising the subject list
	subjectList := []string{}
	for _, eachRelationTuple := range respBody["relation_tuples"].([]interface{}) {
		subject, ok := eachRelationTuple.(map[string]interface{})["subject_id"].(string)
		if ok {
			subjectList = append(subjectList, subject)
		}
	}
	return subjectList, nil
}
