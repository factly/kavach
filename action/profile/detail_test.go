package profile

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/test"
	"github.com/go-chi/chi"
)

func TestProfieDetail(t *testing.T) {

	r := chi.NewRouter()
	r.Get("/profile", detail)

	ts := httptest.NewServer(r)
	defer ts.Close()

	user := &model.User{
		Email: "abc@factly.in",
	}

	model.DB.Create(&user)

	t.Run("Invalid header", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "GET", "/profile", nil, "invalid")

		if statusCode != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusNotFound)
		}
	})

	t.Run("profile not found", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "GET", "/profile", nil, "100")

		if statusCode != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusNotFound)
		}
	})

	t.Run("get profile by id", func(t *testing.T) {
		resp, statusCode := test.Request(t, ts, "GET", "/profile", nil, fmt.Sprint(user.Base.ID))

		respBody := (resp).(map[string]interface{})

		if statusCode != http.StatusOK {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusOK)
		}

		if respBody["email"] != "abc@factly.in" {
			t.Errorf("handler returned wrong title: got %v want %v", respBody["email"], "abc@factly.in")
		}

	})

}
