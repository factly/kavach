package organisation

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/kavach-server/util/test"
	"github.com/go-chi/chi"
)

func TestCreateOrganisation(t *testing.T) {
	test.Init()
	r := chi.NewRouter()
	r.Post("/organisations", create)

	ts := httptest.NewServer(r)
	defer ts.Close()

	t.Run("organisation title required", func(t *testing.T) {
		_, _, statusCode := test.Request(t, ts, "POST", "/organisations", nil, "1")

		if statusCode != http.StatusUnprocessableEntity {
			t.Errorf("handler returned wrong status code: got %v want %v",
				statusCode, http.StatusUnprocessableEntity)
		}
	})

	t.Run("create organisation", func(t *testing.T) {
		_, res, statusCode := test.Request(t, ts, "POST", "/organisations", bytes.NewBuffer([]byte(`
		{
			"title": "ABN"
		}
		`)), "1")

		if statusCode != http.StatusCreated {
			t.Errorf("handler returned wrong status code: got %v want %v",
				statusCode, http.StatusCreated)
		}

		if res["title"] != "ABN" {
			t.Errorf("handler returned wrong title: got %v want %v", res["title"], "ABN")
		}

	})

}
