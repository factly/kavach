package user

import (
	"bytes"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/test"
	"github.com/go-chi/chi"
)

var jsonStr = []byte(`
{
	"email": "test@gmail.com",
	"role": "owner"
}`)

func TestCreateOrganisationUser(t *testing.T) {
	r := chi.NewRouter()
	r.Post("/organisations/{organisation_id}/users", create)

	ts := httptest.NewServer(r)
	defer ts.Close()

	user := model.User{
		Email: "Joey@test.in",
	}

	organisation := model.Organisation{
		Title: "Tester",
	}

	model.DB.Create(&user)
	model.DB.Create(&organisation)

	t.Log(user)
	t.Log(organisation)

	orgUser := model.OrganisationUser{
		OrganisationID: organisation.Base.ID,
		UserID:         user.Base.ID,
		Role:           "owner",
	}

	model.DB.Create(&orgUser)

	t.Run("organisation user validation", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "POST", "/organisations/10/users", bytes.NewBuffer([]byte{}), "1")

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
