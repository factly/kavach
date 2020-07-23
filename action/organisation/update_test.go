package organisation

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/kavach-server/util/test"
	"github.com/go-chi/chi"
)

func TestOrganisationUpdate(t *testing.T) {
	r := chi.NewRouter()
	r.Put("/organisations/{organisation_id}", update)

	ts := httptest.NewServer(r)
	defer ts.Close()

	t.Run("record not found", func(t *testing.T) {
		_, _, statusCode := test.Request(t, ts, "PUT", "/organisations/100", nil, "1")

		if statusCode != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusNotFound)
		}
	})

	t.Run("Invalid header", func(t *testing.T) {
		_, _, statusCode := test.Request(t, ts, "PUT", "/organisations/100", nil, "abc")

		if statusCode != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusNotFound)
		}

	})

	t.Run("update organisation by id", func(t *testing.T) {
		_, res, statusCode := test.Request(t, ts, "PUT", "/organisations/13", bytes.NewBuffer([]byte(`
		{
			"title": "Eenadu"
		}
		`)), "abc")

		if statusCode != http.StatusOK {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusOK)
		}

		if res["title"] != "Eenadu" {
			t.Errorf("handler returned wrong title: got %v want %v", res["title"], "Eenadu")
		}
	})

}
