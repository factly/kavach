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

func TestListOrganisation(t *testing.T) {
	r := chi.NewRouter()
	r.Use(loggerx.Init())
	r.Get("/organisations/my", list)

	ts := httptest.NewServer(r)
	defer ts.Close()

	organisationUsers := []model.OrganisationUser{}

	user := model.User{
		Email: "tester@test.in",
	}

	organisationOne := model.Organisation{
		Title: "Tester",
	}
	organisationTwo := model.Organisation{
		Title: "Tester",
	}

	model.DB.Create(&user)

	model.DB.Create(&organisationOne)
	model.DB.Create(&organisationTwo)

	userOrgOne := model.OrganisationUser{
		UserID:         user.Base.ID,
		OrganisationID: organisationOne.Base.ID,
		Role:           "owner",
	}

	userOrgTwo := model.OrganisationUser{
		UserID:         user.Base.ID,
		OrganisationID: organisationTwo.Base.ID,
		Role:           "owner",
	}

	model.DB.Create(&userOrgOne)
	model.DB.Create(&userOrgTwo)

	model.DB.Model(&model.OrganisationUser{}).Where(&model.OrganisationUser{
		UserID: user.Base.ID,
	}).Preload("Organisation").Find(&organisationUsers)

	t.Run("Invalid header", func(t *testing.T) {
		_, statusCode := test.Request(t, ts, "GET", "/organisations/my", nil, "abc")

		if statusCode != http.StatusBadRequest {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusBadRequest)
		}

	})

	t.Run("get all organisation", func(t *testing.T) {
		resp, statusCode := test.Request(t, ts, "GET", "/organisations/my", nil, fmt.Sprint(user.Base.ID))

		if statusCode != http.StatusOK {
			t.Errorf("handler returned wrong status code: got %v want %v",
				statusCode, http.StatusOK)
		}

		respBody := (resp).([]interface{})

		if len(respBody) != len(organisationUsers) {
			t.Errorf("handler returned wrong total: got %v want %v",
				len(respBody), len(organisationUsers))
		}

	})

}
