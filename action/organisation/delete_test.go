package organisation

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/kavach-server/util/test"
	"github.com/go-chi/chi"
)

func TestDeleteOrganisation(t *testing.T) {
	r := chi.NewRouter()
	r.Delete("/organisations/{organisation_id}", delete)

	ts := httptest.NewServer(r)
	defer ts.Close()

	t.Run("record not found", func(t *testing.T) {
		_, _, statusCode := test.Request(t, ts, "DELETE", "/organisations/100", nil, "1")

		if statusCode != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusNotFound)
		}
	})

	t.Run("delete organisation by id", func(t *testing.T) {
		_, _, statusCode := test.Request(t, ts, "DELETE", "/organisations/12", nil, "1")

		if statusCode != http.StatusOK {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusOK)
		}
	})

}
