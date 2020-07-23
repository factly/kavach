package profile

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/test"
	"github.com/go-chi/chi"
)

func TestProfieDetail(t *testing.T) {
	model.SetupDB()

	r := chi.NewRouter()
	r.Get("/profile", detail)

	ts := httptest.NewServer(r)
	defer ts.Close()

	t.Run("Invalid header", func(t *testing.T) {
		_, _, statusCode := test.Request(t, ts, "GET", "/profile", nil, "abc")

		if statusCode != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusNotFound)
		}
	})

	t.Run("profile not found", func(t *testing.T) {
		_, _, statusCode := test.Request(t, ts, "GET", "/profile", nil, "100")

		if statusCode != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusNotFound)
		}
	})

	t.Run("get profile by id", func(t *testing.T) {
		_, res, statusCode := test.Request(t, ts, "GET", "/profile", nil, "5")

		if statusCode != http.StatusOK {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusOK)
		}

		if res["email"] != "abc@factly.in" {
			t.Errorf("handler returned wrong title: got %v want %v", res["email"], "abc@factly.in")
		}

	})

}
