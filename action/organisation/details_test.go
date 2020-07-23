package organisation

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/kavach-server/util/test"
	"github.com/go-chi/chi"
)

func TestOrganisationDetail(t *testing.T) {
	r := chi.NewRouter()
	r.Get("/organisations/{organisation_id}", details)

	ts := httptest.NewServer(r)
	defer ts.Close()

	t.Run("record not found", func(t *testing.T) {
		_, _, statusCode := test.Request(t, ts, "GET", "/organisations/100", nil, "1")

		if statusCode != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusNotFound)
		}
	})

	t.Run("get organisation by id", func(t *testing.T) {
		_, res, statusCode := test.Request(t, ts, "GET", "/organisations/11", nil, "1")

		if statusCode != http.StatusOK {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusOK)
		}

		if res["title"] != "Times of India" {
			t.Errorf("handler returned wrong title: got %v want %v", res["title"], "Times of India")
		}

	})

}
