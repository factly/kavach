package user

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/kavach-server/util/test"
	"github.com/go-chi/chi"
)

func TestDeleteOrganisationUser(t *testing.T) {

	r := chi.NewRouter()
	r.Delete("/organisations/{organisation_id}/users/{user_id}", delete)

	ts := httptest.NewServer(r)
	defer ts.Close()

	t.Run("invalid organisation id", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "DELETE", "/organisations/invalid/users/1", bytes.NewBuffer([]byte{}), "1")

		if statusCode != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusNotFound)
		}

	})

	t.Run("invalid user id", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "DELETE", "/organisations/1/users/invalid", bytes.NewBuffer([]byte{}), "1")

		if statusCode != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusNotFound)
		}

	})

	t.Run("user not found", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "DELETE", "/organisations/1/users/100", bytes.NewBuffer([]byte{}), "1")

		if statusCode != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusNotFound)
		}

	})

	t.Run("delete organisation user", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "DELETE", "/organisations/1/users/1", bytes.NewBuffer([]byte{}), "1")

		if statusCode != http.StatusOK {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusOK)
		}

	})

}
