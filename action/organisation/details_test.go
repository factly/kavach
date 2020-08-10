package organisation

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/test"
	"github.com/go-chi/chi"
)

func TestOrganisationDetail(t *testing.T) {
	r := chi.NewRouter()
	r.Get("/organisations/{organisation_id}", details)

	ts := httptest.NewServer(r)
	defer ts.Close()

	t.Run("invalid organisation id", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "GET", "/organisations/test", nil, "1")

		if statusCode != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusNotFound)
		}
	})

	t.Run("record not found", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "GET", "/organisations/100", nil, "1")

		if statusCode != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusNotFound)
		}
	})

	t.Run("get organisation by id", func(t *testing.T) {
		org := &model.Organisation{
			Title: "TOI",
		}

		model.DB.Model(&model.Organisation{}).Create(&org)
		resp, statusCode := test.Request(t, ts, "GET", fmt.Sprint("/organisations/", org.Base.ID), nil, "1")
		respBody := (resp).(map[string]interface{})

		if statusCode != http.StatusOK {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusOK)
		}

		if respBody["title"] != "TOI" {
			t.Errorf("handler returned wrong title: got %v want %v", respBody["title"], "TOI")
		}

	})

}
