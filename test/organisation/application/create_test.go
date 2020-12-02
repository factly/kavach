package application

import (
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/test/medium"
	"github.com/factly/kavach-server/test/organisation/user"
	"github.com/factly/kavach-server/util/test"
	"github.com/gavv/httpexpect"
)

func TestCreateApplication(t *testing.T) {

	// Setup DB
	mock := test.SetupMockDB()

	// Setup HttpExpect
	router := action.RegisterRoutes()
	server := httptest.NewServer(router)
	defer server.Close()

	e := httpexpect.New(t, server.URL)

	t.Run("invalid organisation id", func(t *testing.T) {
		e.POST(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "invalid",
			}).
			WithHeader("X-User", "1").
			WithJSON(Application).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("invalid user id header", func(t *testing.T) {
		e.POST(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
			}).
			WithHeader("X-User", "invalid").
			WithJSON(Application).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("undecodable application", func(t *testing.T) {
		e.POST(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
			}).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("invalid application object", func(t *testing.T) {
		e.POST(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
			}).
			WithHeader("X-User", "1").
			WithJSON(invalidApplication).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("user not owner of organisation", func(t *testing.T) {
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "organisation_users"`)).
			WithArgs(1, 1, "owner").
			WillReturnRows(sqlmock.NewRows(user.OrganisationUserCols))

		e.POST(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
			}).
			WithHeader("X-User", "1").
			WithJSON(Application).
			Expect().
			Status(http.StatusUnauthorized)

		test.ExpectationsMet(t, mock)
	})

	t.Run("media does not belong to user", func(t *testing.T) {
		user.OrganisationUserOwnerSelectMock(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "media"`)).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(mediumCols))

		e.POST(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
			}).
			WithHeader("X-User", "1").
			WithJSON(Application).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})

	t.Run("create a application", func(t *testing.T) {
		user.OrganisationUserOwnerSelectMock(mock)

		mock.ExpectBegin()
		medium.SelectQuery(mock, 1, 1)
		mock.ExpectQuery(`INSERT INTO "applications"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 1, 1, Application["name"], Application["description"], Application["url"], Application["medium_id"], Application["organisation_id"]).
			WillReturnRows(sqlmock.NewRows([]string{"id", "medium_id"}).AddRow(1, 1))
		mock.ExpectCommit()

		e.POST(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
			}).
			WithHeader("X-User", "1").
			WithJSON(Application).
			Expect().
			Status(http.StatusCreated).
			JSON().
			Object().
			ContainsMap(Application)

		test.ExpectationsMet(t, mock)
	})
}
