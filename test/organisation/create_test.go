package organisation

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/test/organisation/user"
	"github.com/factly/kavach-server/util/test"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestCreateOrganisation(t *testing.T) {

	// Setup DB
	mock := test.SetupMockDB()

	// Setup HttpExpect
	router := action.RegisterRoutes()
	server := httptest.NewServer(router)
	defer server.Close()

	defer gock.Off()

	e := httpexpect.New(t, server.URL)

	t.Run("create organisation", func(t *testing.T) {
		mock.ExpectBegin()
		mock.ExpectQuery(`INSERT INTO "organisations"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Organisation["title"]).
			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))

		mock.ExpectQuery(`INSERT INTO "organisation_users"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, user.OrganisationUser["user_id"], user.OrganisationUser["organisation_id"], user.OrganisationUser["role"]).
			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
		mock.ExpectCommit()

		e.POST(basePath).
			WithHeader("X-User", "1").
			WithJSON(Organisation).
			Expect().
			Status(http.StatusCreated).
			JSON().
			Object().
			ContainsMap(Organisation)
	})

	t.Run("organisation title required", func(t *testing.T) {
		e.POST(basePath).
			WithHeader("X-User", "1").
			WithJSON(invalidOrganisation).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	gock.New("http://keto.com").
		Put("/engines/acp/ory/regex/roles").
		MatchType("json").
		JSON(map[string]interface{}{"id": "roles:org:1:admin", "members": []string{"1"}}).
		Reply(http.StatusOK)

	gock.New("http://keto.com").
		Put("/engines/acp/ory/regex/policies").
		MatchType("json").
		JSON(map[string]interface{}{
			"id":        "org:1:admins",
			"subjects":  []string{"roles:org:1:admin"},
			"resources": []string{"resources:org:1:<.*>"},
			"actions":   []string{"actions:org:1:<.*>"},
			"effect":    "allow",
		}).
		Reply(http.StatusOK)
}
