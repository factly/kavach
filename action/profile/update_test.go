package profile

import (
	"bytes"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/test"
	"github.com/factly/x/loggerx"
	"github.com/go-chi/chi"
)

var jsonStr = []byte(`
{
	"first_name": "Joe",
	"last_name": "Doe",
	"birth_date": "1984-5-13T14:00:12-00:00",
	"gender" : "male"
}`)

func TestProfieUpdate(t *testing.T) {

	r := chi.NewRouter()
	r.Use(loggerx.Init())
	r.Put("/profile", update)
	ts := httptest.NewServer(r)
	defer ts.Close()

	user := &model.User{
		Email: "check@check.in",
	}

	model.DB.Create(&user)

	t.Run("Invalid header", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "PUT", "/profile", nil, "abc")

		if statusCode != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusNotFound)
		}
	})

	t.Run("profile not found", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "PUT", "/profile", nil, "100")

		if statusCode != http.StatusInternalServerError {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusInternalServerError)
		}
	})

	t.Run("update profile by id", func(t *testing.T) {
		resp, statusCode := test.Request(t, ts, "PUT", "/profile", bytes.NewBuffer(jsonStr), fmt.Sprint(user.Base.ID))

		respBody := (resp).(map[string]interface{})

		if statusCode != http.StatusOK {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusOK)
		}

		if respBody["first_name"] != "Joe" {
			t.Errorf("handler returned wrong title: got %v want %v", respBody["first_name"], "Joe")
		}

	})

}
