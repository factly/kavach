package profile

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/test"
	"github.com/go-chi/chi"
)

var jsonStr = []byte(`
{
	"first_name": "shashi",
	"last_name": "deshetti",
	"birth_date": "1984-5-13T14:00:12-00:00",
	"gender" : "male"
}`)

func TestProfieUpdate(t *testing.T) {
	model.SetupDB()

	r := chi.NewRouter()
	r.Put("/profile", update)
	ts := httptest.NewServer(r)
	defer ts.Close()

	t.Run("Invalid header", func(t *testing.T) {
		_, _, statusCode := test.Request(t, ts, "PUT", "/profile", nil, "abc")

		if statusCode != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusNotFound)
		}
	})

	t.Run("profile not found", func(t *testing.T) {
		_, _, statusCode := test.Request(t, ts, "PUT", "/profile", nil, "100")

		if statusCode != http.StatusInternalServerError {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusInternalServerError)
		}
	})

	t.Run("update profile by id", func(t *testing.T) {
		_, res, statusCode := test.Request(t, ts, "PUT", "/profile", bytes.NewBuffer(jsonStr), "5")

		if statusCode != http.StatusOK {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusOK)
		}

		if res["first_name"] != "shashi" {
			t.Errorf("handler returned wrong title: got %v want %v", res["first_name"], "shashi")
		}

	})

}
