package token

import (
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/test/organisation/user"
	"github.com/factly/kavach-server/util/test"
	"github.com/gavv/httpexpect"
)

func TestListApplicationToken(t *testing.T) {

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

	t.Run("get list of application users", func(t *testing.T) {
		user.OrganisationUserSelectMock(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(1) FROM "application_tokens"`)).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).
				AddRow(len(applicationTokenList)))

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(ApplicationTokenCols).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, applicationTokenList[0]["name"], applicationTokenList[0]["description"], 1, applicationTokenList[0]["access_token"], applicationTokenList[0]["hashed_token"]).
				AddRow(2, time.Now(), time.Now(), nil, 1, 1, applicationTokenList[1]["name"], applicationTokenList[1]["description"], 1, applicationTokenList[1]["access_token"], applicationTokenList[1]["hashed_token"]))

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
			ContainsMap(map[string]interface{}{"total": len(applicationTokenList)}).
			Value("nodes").
			Array().
			Element(0).Object()
		test.ExpectationsMet(t, mock)
	})
}
