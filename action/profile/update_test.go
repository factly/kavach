package profile

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/kavach-server/model"
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

	t.Run("update profile", func(t *testing.T) {
		req, err := http.NewRequest("PUT", "/profile", bytes.NewBuffer(jsonStr))
		if err != nil {
			t.Fatal(err)
		}
		rr := httptest.NewRecorder()

		req.Header = map[string][]string{
			"X-User": {"3"},
		}

		r.ServeHTTP(rr, req)

		if status := rr.Code; status != http.StatusOK {
			t.Errorf("handler returned wrong status code: got %v want %v",
				status, http.StatusOK)
		}
	})

	t.Run("record not found", func(t *testing.T) {
		req, err := http.NewRequest("PUT", "/profile", bytes.NewBuffer(jsonStr))
		if err != nil {
			t.Fatal(err)
		}
		rr := httptest.NewRecorder()

		req.Header = map[string][]string{
			"X-User": {"8"},
		}

		r.ServeHTTP(rr, req)

		if status := rr.Code; status != http.StatusInternalServerError {
			t.Errorf("handler returned wrong status code: got %v want %v",
				status, http.StatusNotFound)
		}
	})

	t.Run("Invalid id", func(t *testing.T) {
		req, err := http.NewRequest("PUT", "/profile", bytes.NewBuffer(jsonStr))
		if err != nil {
			t.Fatal(err)
		}
		rr := httptest.NewRecorder()

		req.Header = map[string][]string{
			"X-User": {"abc"},
		}

		r.ServeHTTP(rr, req)

		if status := rr.Code; status != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v",
				status, http.StatusNotFound)
		}
	})

}
