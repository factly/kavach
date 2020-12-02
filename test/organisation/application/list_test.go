package application

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
	"github.com/factly/kavach-server/util/test"
	"github.com/gavv/httpexpect"
)

func TestListApplications(t *testing.T) {

	// Setup DB
	mock := test.SetupMockDB()

	// Setup HttpExpect
	router := action.RegisterRoutes()
	server := httptest.NewServer(router)
	defer server.Close()

	e := httpexpect.New(t, server.URL)

	t.Run("invalid organisation id", func(t *testing.T) {
		e.GET(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "invalid",
			}).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("invalid user id header", func(t *testing.T) {
		e.GET(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
			}).
			WithHeader("X-User", "invalid").
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("user is not part of organisation", func(t *testing.T) {
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "organisation_users"`)).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(user.OrganisationUserCols))

		e.GET(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
			}).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusUnauthorized)
		test.ExpectationsMet(t, mock)
	})

	t.Run("get list of applications", func(t *testing.T) {
		user.OrganisationUserSelectMock(mock)

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(ApplicationCols).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, applicationList[0]["name"], applicationList[0]["description"], applicationList[0]["url"], applicationList[0]["medium_id"], applicationList[0]["organisation_id"]).
				AddRow(2, time.Now(), time.Now(), nil, 1, 1, applicationList[1]["name"], applicationList[1]["description"], applicationList[1]["url"], applicationList[1]["medium_id"], applicationList[1]["organisation_id"]))

		medium.SelectQuery(mock, 1)

		res := e.GET(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
			}).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusOK).
			JSON().
			Array()

		res.Length().Equal(len(applicationList))
		res.Element(0).Object().ContainsMap(applicationList[0])
		res.Element(1).Object().ContainsMap(applicationList[1])

		test.ExpectationsMet(t, mock)
	})
}
