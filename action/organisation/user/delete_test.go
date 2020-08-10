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

func TestDeleteOrganisationUser(t *testing.T) {

	r := chi.NewRouter()
	r.Use(loggerx.Init())
	r.Delete("/organisations/{organisation_id}/users/{user_id}", delete)

	ts := httptest.NewServer(r)
	defer ts.Close()

	user := model.User{
		Email: "Ross@test.in",
	}

	testUser := model.User{
		Email: "Phoebe@test.in",
	}

	organisation := model.Organisation{
		Title: "TOI",
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

	t.Run("invalid organisation id", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "DELETE", "/organisations/invalid/users/1", bytes.NewBuffer([]byte{}), "1")

		if statusCode != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusNotFound)
		}

	})

	t.Run("invalid user header", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "DELETE", "/organisations/1/users/100", bytes.NewBuffer([]byte{}), "invalid_id")

		if statusCode != http.StatusInternalServerError {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusInternalServerError)
		}

	})

	t.Run("check user is owner or not", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "DELETE", fmt.Sprint("/organisations/", organisation.Base.ID, "/users/", fmt.Sprint(testUser.Base.ID)), bytes.NewBuffer([]byte{}), fmt.Sprint(testUser.Base.ID))

		if statusCode != http.StatusUnprocessableEntity {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusUnprocessableEntity)
		}

	})

	t.Run("user not found", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "DELETE", "/organisations/1/users/100", bytes.NewBuffer([]byte{}), "1")

		if statusCode != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusNotFound)
		}

	})

	t.Run("delete organisation user", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "DELETE", "/organisations/1/users/1", bytes.NewBuffer([]byte{}), "1")

		if statusCode != http.StatusOK {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusOK)
		}

	})

}
