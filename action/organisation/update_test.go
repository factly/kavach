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

func TestOrganisationUpdate(t *testing.T) {
	r := chi.NewRouter()
	r.Use(loggerx.Init())
	r.Put("/organisations/{organisation_id}", update)

	ts := httptest.NewServer(r)
	defer ts.Close()

	user := model.User{
		Email: "tester@check.in",
	}

	testUser := model.User{
		Email: "editor@check.in",
	}

	organisation := model.Organisation{
		Title: "The Hindu",
	}

	model.DB.Create(&user)
	model.DB.Create(&testUser)
	model.DB.Create(&organisation)

	userOrg := model.OrganisationUser{
		UserID:         user.Base.ID,
		OrganisationID: organisation.Base.ID,
		Role:           "owner",
	}
	testUserOrg := model.OrganisationUser{
		UserID:         user.Base.ID,
		OrganisationID: organisation.Base.ID,
		Role:           "user",
	}

	model.DB.Create(&userOrg)
	model.DB.Create(&testUserOrg)

	t.Run("invalid organisation id", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "PUT", "/organisations/invalid_id", nil, "1")

		if statusCode != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusNotFound)
		}
	})

	t.Run("user without role owner", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "PUT", fmt.Sprint("/organisations/", organisation.Base.ID), nil, fmt.Sprint(testUser.Base.ID))

		if statusCode != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusNotFound)
		}
	})

	t.Run("record not found", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "PUT", "/organisations/100", nil, "1")

		if statusCode != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusNotFound)
		}
	})

	t.Run("Invalid header", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "PUT", "/organisations/100", nil, "invalid")

		if statusCode != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusNotFound)
		}

	})

	t.Run("update organisation by id", func(t *testing.T) {
		resp, statusCode := test.Request(t, ts, "PUT", fmt.Sprint("/organisations/", organisation.Base.ID), bytes.NewBuffer([]byte(`
		{
			"title": "Eenadu"
		}
		`)), fmt.Sprint(user.Base.ID))

		respBody := (resp).(map[string]interface{})

		if statusCode != http.StatusOK {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusOK)
		}

		if respBody["title"] != "Eenadu" {
			t.Errorf("handler returned wrong title: got %v want %v", respBody["title"], "Eenadu")
		}
	})

}
