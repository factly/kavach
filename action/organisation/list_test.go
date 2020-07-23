package organisation

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/kavach-server/util/test"
	"github.com/go-chi/chi"
)

func TestListOrganisation(t *testing.T) {
	r := chi.NewRouter()
	r.Get("/organisations/my", list)

	ts := httptest.NewServer(r)
	defer ts.Close()

	t.Run("Invalid header", func(t *testing.T) {
		_, _, statusCode := test.Request(t, ts, "GET", "/organisations/my", nil, "abc")

		if statusCode != http.StatusBadRequest {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusBadRequest)
		}

	})

	t.Run("get all organisation", func(t *testing.T) {
		_, _, statusCode := test.Request(t, ts, "GET", "/organisations/my", nil, "1")

		if statusCode != http.StatusOK {
			t.Errorf("handler returned wrong status code: got %v want %v",
				statusCode, http.StatusOK)
		}

	})

}
