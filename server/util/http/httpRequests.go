package customHTTP

import (
	"bytes"
	"encoding/json"
	"net/http"
	"time"
)

// httpClient bounds every outbound request so a stalled upstream cannot hang the caller.
var httpClient = &http.Client{Timeout: 10 * time.Second}

func SendRequest(method, url string, body *bytes.Buffer) (uint, map[string]interface{}, error) {
	var req *http.Request
	var err error
	if body == nil {
		req, err = http.NewRequest(method, url, nil)
	} else {
		req, err = http.NewRequest(method, url, body)
	}
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}

	response, err := httpClient.Do(req)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}
	defer response.Body.Close()

	responseBody := make(map[string]interface{})
	err = json.NewDecoder(response.Body).Decode(&responseBody)
	if err != nil {
		return http.StatusInternalServerError, nil, err
	}
	return uint(response.StatusCode), responseBody, err
}
