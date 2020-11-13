package organisation

import (
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/test/medium"
	"github.com/factly/kavach-server/util/test"
	"github.com/gavv/httpexpect"
)

func TestListAllOrganisation(t *testing.T) {

	// Setup DB
	mock := test.SetupMockDB()

	// Setup HttpExpect
	router := action.RegisterRoutes()
	server := httptest.NewServer(router)
	defer server.Close()

	e := httpexpect.New(t, server.URL)

	t.Run("get list of all organisation", func(t *testing.T) {

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(1) FROM "organisations"`)).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))
		OrganisationSelectMock(mock)
		medium.SelectQuery(mock, 1)

		e.GET(basePath).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			Value("nodes").
			Array().
			Length().
			Equal(1)

		test.ExpectationsMet(t, mock)
	})

	t.Run("get list of all organisation with query q", func(t *testing.T) {

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(1) FROM "organisations"`)).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))
		OrganisationSelectMock(mock)
		medium.SelectQuery(mock, 1)

		e.GET(basePath).
			WithHeader("X-User", "1").
			WithQuery("q", "test").
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			Value("nodes").
			Array().
			Length().
			Equal(1)

		test.ExpectationsMet(t, mock)
	})
}
