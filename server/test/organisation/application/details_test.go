package application

import (
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

	"github.com/factly/kavach-server/test/medium"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/test/organisation/application/token"
	"github.com/factly/kavach-server/test/organisation/user"

	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/util/test"
	"github.com/gavv/httpexpect"
)

func TestDetailApplication(t *testing.T) {

	// Setup DB
	mock := test.SetupMockDB()

	// Setup HttpExpect
	router := action.RegisterRoutes()
	server := httptest.NewServer(router)
	defer server.Close()

	e := httpexpect.New(t, server.URL)

	t.Run("invalid application id", func(t *testing.T) {
		e.GET(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "invalid",
			}).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("invalid organisation id", func(t *testing.T) {
		e.GET(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "invalid",
				"application_id":  "1",
			}).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("invalid user id header", func(t *testing.T) {
		e.GET(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
			}).
			WithHeader("X-User", "invalid").
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("user is not part of organisation", func(t *testing.T) {
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "organisation_users"`)).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(user.OrganisationUserCols))

		e.GET(path).
			WithHeader("X-User", "1").
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
			}).
			Expect().
			Status(http.StatusUnauthorized)
		test.ExpectationsMet(t, mock)
	})

	t.Run("application record not found", func(t *testing.T) {
		user.OrganisationUserSelectMock(mock)

		mock.ExpectQuery(selectQuery).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(ApplicationCols))

		e.GET(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
			}).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusNotFound)
		test.ExpectationsMet(t, mock)
	})

	t.Run("get application by id", func(t *testing.T) {
		user.OrganisationUserSelectMock(mock)

		ApplicationSelectMock(mock, 1, 1)

		medium.SelectQuery(mock, 1)
		token.ApplicationTokenSelect(mock)

		e.GET(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
			}).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(Application)
		test.ExpectationsMet(t, mock)
	})
}
