package customHTTP

import (
	"bytes"
	"encoding/json"
	"net/http"
)

func SendRequest(method, url string, body *bytes.Buffer) (uint, map[string]interface{}, error) {
	var req *http.Request
	var err error
	if body == nil{
		req, err = http.NewRequest(method, url, nil)
	} else {
		req, err = http.NewRequest(method, url, body)
	}
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	client := &http.Client{}
	response, err := client.Do(req)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	responseBody := make(map[string]interface{})
	err = json.NewDecoder(response.Body).Decode(&responseBody)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}
	return uint(response.StatusCode), responseBody, err
}
