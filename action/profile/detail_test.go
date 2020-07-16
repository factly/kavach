package profile

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/kavach-server/model"
	"github.com/go-chi/chi"
)

func TestProfieDetail(t *testing.T) {
	model.SetupDB()

	r := chi.NewRouter()
	r.Get("/profile", detail)

	t.Run("get profile by id", func(t *testing.T) {
		req, err := http.NewRequest("GET", "/profile", nil)
		if err != nil {
			t.Fatal(err)
		}
		rr := httptest.NewRecorder()

		req.Header = map[string][]string{
			"X-User": {"1"},
		}

		r.ServeHTTP(rr, req)

		if status := rr.Code; status != http.StatusOK {
			t.Errorf("handler returned wrong status code: got %v want %v",
				status, http.StatusOK)
		}
	})

	t.Run("record not found", func(t *testing.T) {
		req, err := http.NewRequest("GET", "/profile", nil)
		if err != nil {
			t.Fatal(err)
		}
		rr := httptest.NewRecorder()

		req.Header = map[string][]string{
			"X-User": {"8"},
		}

		r.ServeHTTP(rr, req)

		if status := rr.Code; status != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v",
				status, http.StatusNotFound)
		}
	})

	t.Run("Invalid id", func(t *testing.T) {
		req, err := http.NewRequest("GET", "/profile", nil)
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
