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
	test.Init()
	r := chi.NewRouter()
	r.Delete("/organisations/{organisation_id}/users/{user_id}", delete)

	ts := httptest.NewServer(r)
	defer ts.Close()

	t.Run("user not found", func(t *testing.T) {
		_, _, statusCode := test.Request(t, ts, "DELETE", "/organisations/1/users/100", bytes.NewBuffer([]byte{}), "1")

		if statusCode != http.StatusUnprocessableEntity {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusUnprocessableEntity)
		}

	})

	t.Run("delete organisation user", func(t *testing.T) {
		_, _, statusCode := test.Request(t, ts, "DELETE", "/organisations/1/users/1", bytes.NewBuffer([]byte{}), "1")

		if statusCode != http.StatusOK {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusOK)
		}

	})

}
