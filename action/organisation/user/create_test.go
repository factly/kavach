package user

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/kavach-server/util/test"
	"github.com/go-chi/chi"
)

var jsonStr = []byte(`
{
	"email": "test@gmail.com",
	"role": "owner"
}`)

func TestCreateOrganisationUser(t *testing.T) {
	test.Init()
	r := chi.NewRouter()
	r.Post("/organisations/{organisation_id}/users", create)

	ts := httptest.NewServer(r)
	defer ts.Close()

	t.Run("organisation user validation", func(t *testing.T) {
		_, _, statusCode := test.Request(t, ts, "POST", "/organisations/10/users", bytes.NewBuffer([]byte{}), "1")

		if statusCode != http.StatusUnprocessableEntity {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusUnprocessableEntity)
		}

	})

	t.Run("create organisation user", func(t *testing.T) {
		_, res, statusCode := test.Request(t, ts, "POST", "/organisations/10/users", bytes.NewBuffer([]byte(jsonStr)), "1")

		if statusCode != http.StatusCreated {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusCreated)
		}

		if res["email"] != "test@gmail.com" {
			t.Errorf("handler returned wrong status code: got %v want %v", res["email"], "test@gmail.com")
		}

	})

}
