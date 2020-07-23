package user

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/kavach-server/util/test"
	"github.com/go-chi/chi"
)

func TestOrganisationUserList(t *testing.T) {
	test.Init()
	r := chi.NewRouter()
	r.Get("/organisations/{organisation_id}/users", list)

	ts := httptest.NewServer(r)
	defer ts.Close()

	t.Run("Invalid organisation id", func(t *testing.T) {
		_, _, statusCode := test.Request(t, ts, "GET", "/organisations/abc/users", nil, "1")

		if statusCode != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusNotFound)
		}

	})

	t.Run("get organisation users", func(t *testing.T) {
		_, _, statusCode := test.Request(t, ts, "GET", "/organisations/10/users", nil, "1")

		if statusCode != http.StatusOK {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusOK)
		}

	})

}
