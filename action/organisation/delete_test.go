package organisation

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/test"
	"github.com/factly/x/loggerx"
	"github.com/go-chi/chi"
)

func TestDeleteOrganisation(t *testing.T) {
	r := chi.NewRouter()
	r.Use(loggerx.Init())
	r.Delete("/organisations/{organisation_id}", delete)

	ts := httptest.NewServer(r)
	defer ts.Close()

	user := model.User{
		Email: "joe@cnn.in",
	}

	testUser := model.User{
		Email: "editor@bbc.in",
	}

	org := &model.Organisation{
		Title: "CNN",
	}

	model.DB.Create(&user)
	model.DB.Create(&testUser)
	model.DB.Model(&model.Organisation{}).Create(&org)
	model.DB.Create(&model.OrganisationUser{
		OrganisationID: org.ID,
		Role:           "owner",
		UserID:         user.Base.ID,
	})
	model.DB.Create(&model.OrganisationUser{
		OrganisationID: org.ID,
		Role:           "editor",
		UserID:         testUser.Base.ID,
	})

	t.Run("invalid organisation id", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "DELETE", "/organisations/invalid_id", nil, "1")

		if statusCode != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusNotFound)
		}
	})

	t.Run("record not found", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "DELETE", "/organisations/100", nil, "1")

		if statusCode != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusNotFound)
		}
	})

	t.Run("invalid user ", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "DELETE", fmt.Sprint("/organisations/", org.Base.ID), nil, "invalid_id")

		if statusCode != http.StatusInternalServerError {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusInternalServerError)
		}
	})

	t.Run("user without role owner", func(t *testing.T) {

		_, statusCode := test.Request(t, ts, "DELETE", fmt.Sprint("/organisations/", org.Base.ID), nil, fmt.Sprint(testUser.Base.ID))

		if statusCode != http.StatusUnprocessableEntity {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusUnprocessableEntity)
		}
	})

	t.Run("delete organisation by id", func(t *testing.T) {

		_, statusCode := test.Request(t, ts, "DELETE", fmt.Sprint("/organisations/", org.Base.ID), nil, fmt.Sprint(user.Base.ID))

		if statusCode != http.StatusOK {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusOK)
		}
	})

}
