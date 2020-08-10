package user

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
	"email": "test@gmail.com",
	"role": "owner"
}`)

func TestCreateOrganisationUser(t *testing.T) {
	r := chi.NewRouter()
	r.Use(loggerx.Init())
	r.Post("/organisations/{organisation_id}/users", create)

	ts := httptest.NewServer(r)
	defer ts.Close()

	user := model.User{
		Email: "Joey@test.in",
	}

	testUser := model.User{
		Email: "Biden@test.in",
	}

	organisation := model.Organisation{
		Title: "Tester",
	}

	model.DB.Create(&user)
	model.DB.Create(&testUser)
	model.DB.Create(&organisation)

	orgUser := model.OrganisationUser{
		OrganisationID: organisation.Base.ID,
		UserID:         user.Base.ID,
		Role:           "owner",
	}
	orgTestUser := model.OrganisationUser{
		OrganisationID: organisation.Base.ID,
		UserID:         user.Base.ID,
		Role:           "editor",
	}

	model.DB.Create(&orgUser)
	model.DB.Create(&orgTestUser)

	t.Run("invalid user id", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "POST", "/organisations/100/users", bytes.NewBuffer([]byte{}), "invalid_id")

		if statusCode != http.StatusInternalServerError {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusInternalServerError)
		}

	})

	t.Run("user is not an owner", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "POST", fmt.Sprint("/organisations/", organisation.Base.ID, "/users"), bytes.NewBuffer([]byte{}), fmt.Sprint(testUser.Base.ID))

		if statusCode != http.StatusUnprocessableEntity {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusUnprocessableEntity)
		}

	})

	t.Run("organisation user validation", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "POST", fmt.Sprint("/organisations/", organisation.Base.ID, "/users"), bytes.NewBuffer([]byte{}), fmt.Sprint(user.Base.ID))

		if statusCode != http.StatusUnprocessableEntity {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusUnprocessableEntity)
		}

	})

	t.Run("invalid organisation id", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "POST", "/organisations/invalid/users", bytes.NewBuffer([]byte{}), "1")

		if statusCode != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusNotFound)
		}

	})

	t.Run("create organisation user", func(t *testing.T) {
		resp, statusCode := test.Request(t, ts, "POST", fmt.Sprint("/organisations/", organisation.Base.ID, "/users"), bytes.NewBuffer([]byte(jsonStr)), fmt.Sprint(organisation.Base.ID))

		if statusCode != http.StatusCreated {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusCreated)
		}
		respBody := (resp).(map[string]interface{})

		if respBody["email"] != "test@gmail.com" {
			t.Errorf("handler returned wrong status code: got %v want %v", respBody["email"], "test@gmail.com")
		}

	})

}
