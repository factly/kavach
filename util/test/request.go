package test

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/kavach-server/model"
)

// Request - test request
func Request(t *testing.T, ts *httptest.Server, method, path string, body io.Reader, header string) (interface{}, int) {
	req, err := http.NewRequest(method, ts.URL+path, body)
	if err != nil {
		t.Fatal(err)
		return nil, http.StatusServiceUnavailable
	}

	req.Header = map[string][]string{
		"X-User": {header},
	}

	req.Close = true

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
		return nil, http.StatusServiceUnavailable
	}

	var respBody interface{}

	json.NewDecoder(resp.Body).Decode(&respBody)
	defer resp.Body.Close()

	return respBody, resp.StatusCode
}

// CleanTables - to clean tables in DB
func CleanTables() {
	model.DB.Model(&model.OrganisationUser{}).RemoveForeignKey("user_id", "users(id)")
	model.DB.Model(&model.OrganisationUser{}).RemoveForeignKey("organisation_id", "organisations(id)")

	model.DB.DropTable(&model.OrganisationUser{})
	model.DB.DropTable(&model.Organisation{})
	model.DB.DropTable(&model.User{})

}
