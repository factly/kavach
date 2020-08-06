package user

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/test"
	"github.com/go-chi/chi"
)

func TestOrganisationUserList(t *testing.T) {

	r := chi.NewRouter()
	r.Get("/organisations/{organisation_id}/users", list)

	ts := httptest.NewServer(r)
	defer ts.Close()

	organisationUsers := []model.OrganisationUser{}

	userOne := model.User{
		Email: "user_one@test.in",
	}

	userTwo := model.User{
		Email: "user_two@test.in",
	}

	organisation := model.Organisation{
		Title: "Org",
	}

	model.DB.Create(&userOne)
	model.DB.Create(&userTwo)

	model.DB.Create(&organisation)

	userOrgOne := model.OrganisationUser{
		UserID:         userOne.Base.ID,
		OrganisationID: organisation.Base.ID,
		Role:           "owner",
	}

	userOrgTwo := model.OrganisationUser{
		UserID:         userTwo.Base.ID,
		OrganisationID: organisation.Base.ID,
		Role:           "owner",
	}

	model.DB.Create(&userOrgOne)
	model.DB.Create(&userOrgTwo)

	model.DB.Model(&model.OrganisationUser{}).Where(&model.OrganisationUser{
		OrganisationID: organisation.Base.ID,
	}).Preload("User").Find(&organisationUsers)

	t.Run("Invalid organisation id", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "GET", "/organisations/abc/users", nil, "1")

		if statusCode != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusNotFound)
		}

	})

	t.Run("Invalid user id", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "GET", "/organisations/1/users", nil, "10")

		if statusCode != http.StatusNotFound {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusNotFound)
		}

	})

	t.Run("get organisation users", func(t *testing.T) {
		resp, statusCode := test.Request(t, ts, "GET", fmt.Sprint("/organisations/", organisation.Base.ID, "/users"), nil, fmt.Sprint(userOne.Base.ID))

		if statusCode != http.StatusOK {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusOK)
		}

		respBody := (resp).([]interface{})

		if len(respBody) != len(organisationUsers) {
			t.Errorf("handler returned wrong total: got %v want %v",
				len(respBody), len(organisationUsers))
		}

	})

}
