package organisation

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

func TestCreateOrganisation(t *testing.T) {
	r := chi.NewRouter()
	r.Use(loggerx.Init())
	r.Post("/organisations", create)

	ts := httptest.NewServer(r)
	defer ts.Close()

	user := model.User{
		Email: "joe@bbc.in",
	}

	model.DB.Create(&user)

	t.Run("organisation title required", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "POST", "/organisations", nil, "1")

		if statusCode != http.StatusUnprocessableEntity {
			t.Errorf("handler returned wrong status code: got %v want %v",
				statusCode, http.StatusUnprocessableEntity)
		}
	})

	t.Run("create organisation", func(t *testing.T) {
		resp, statusCode := test.Request(t, ts, "POST", "/organisations", bytes.NewBuffer([]byte(`
		{
			"title": "BBC"
		}
		`)), fmt.Sprint(user.Base.ID))

		respBody := (resp).(map[string]interface{})

		if statusCode != http.StatusCreated {
			t.Errorf("handler returned wrong status code: got %v want %v",
				statusCode, http.StatusCreated)
		}

		if respBody["title"] != "BBC" {
			t.Errorf("handler returned wrong title: got %v want %v", respBody["title"], "BBC")
		}

	})

}
