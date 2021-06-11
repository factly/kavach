package user

import (
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/test/organisation/application"
	"github.com/factly/kavach-server/test/organisation/user"
	"github.com/factly/kavach-server/test/profile"
	"github.com/factly/kavach-server/util/test"
	"github.com/gavv/httpexpect"
)

func TestListApplicationsUser(t *testing.T) {

	// Setup DB
	mock := test.SetupMockDB()

	// Setup HttpExpect
	router := action.RegisterRoutes()
	server := httptest.NewServer(router)
	defer server.Close()

	e := httpexpect.New(t, server.URL)

	t.Run("invalid user id header", func(t *testing.T) {
		e.GET(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
			}).
			WithHeader("X-User", "invalid").
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("invalid organisation id", func(t *testing.T) {
		e.GET(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "invalid",
				"application_id":  "1",
			}).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("invalid application id", func(t *testing.T) {
		e.GET(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "invalid",
			}).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("user not part of organisation", func(t *testing.T) {
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "organisation_users"`)).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(user.OrganisationUserCols))

		e.GET(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
			}).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusUnauthorized)

		test.ExpectationsMet(t, mock)
	})

	t.Run("list application users", func(t *testing.T) {
		user.OrganisationUserSelectMock(mock)

		application.ApplicationSelectMock(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "application_users"`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"application_id", "user_id"}).AddRow(1, 1))

		profile.UserSelectMock(mock)

		e.GET(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
			}).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			Value("users").Array().NotEmpty()

		test.ExpectationsMet(t, mock)
	})
}
