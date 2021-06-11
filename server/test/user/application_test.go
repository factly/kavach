package user

import (
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/test/medium"
	"github.com/factly/kavach-server/test/organisation/user"
	"github.com/factly/kavach-server/test/profile"
	"github.com/factly/kavach-server/util/test"
	"github.com/gavv/httpexpect"
)

func TestApplicationUser(t *testing.T) {
	// Setup DB
	mock := test.SetupMockDB()

	// Setup HttpExpect
	router := action.RegisterRoutes()
	server := httptest.NewServer(router)
	defer server.Close()

	e := httpexpect.New(t, server.URL)

	t.Run("invalid x-user header", func(t *testing.T) {
		e.GET(applicationPath).
			WithHeaders(map[string]string{
				"X-Organisation": "1",
				"X-User":         "invalid",
			}).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("invalid x-organisation header", func(t *testing.T) {
		e.GET(applicationPath).
			WithHeaders(map[string]string{
				"X-Organisation": "invalid",
				"X-User":         "1",
			}).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("empty application slug in query param", func(t *testing.T) {
		e.GET(applicationPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("user not part of organisation", func(t *testing.T) {
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "organisation_users"`)).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(user.OrganisationUserCols))

		e.GET(applicationPath).
			WithHeaders(headers).
			WithQuery("application", "dega").
			Expect().
			Status(http.StatusUnauthorized)

		test.ExpectationsMet(t, mock)
	})

	t.Run("get list of users for a application", func(t *testing.T) {
		user.OrganisationUserSelectMock(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "applications"`)).
			WithArgs("dega", 1).
			WillReturnRows(sqlmock.NewRows(applicationCols).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, application["name"], application["slug"], application["description"], application["url"], application["medium_id"], application["organisation_id"]))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "application_users"`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"application_id", "user_id"}).
				AddRow(1, 1))

		profile.UserSelectMock(mock)
		medium.SelectQuery(mock)

		e.GET(applicationPath).
			WithHeaders(headers).
			WithQuery("application", "dega").
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 1})

		test.ExpectationsMet(t, mock)
	})
}
