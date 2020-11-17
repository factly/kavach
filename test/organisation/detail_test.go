package organisation

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/kavach-server/test/medium"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/test/organisation/user"
	"github.com/factly/kavach-server/util/test"
	"github.com/gavv/httpexpect"
)

func TestDetailOrganisation(t *testing.T) {

	// Setup DB
	mock := test.SetupMockDB()

	// Setup HttpExpect
	router := action.RegisterRoutes()
	server := httptest.NewServer(router)
	defer server.Close()

	e := httpexpect.New(t, server.URL)

	t.Run("get organisation by id", func(t *testing.T) {
		user.OrganisationUserSelectMock(mock)

		OrganisationSelectMock(mock, 1)
		medium.SelectQuery(mock)

		e.GET(path).
			WithPath("organisation_id", "1").
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(Organisation)

		test.ExpectationsMet(t, mock)
	})

	t.Run("organisation record not found", func(t *testing.T) {
		user.OrganisationUserSelectMock(mock)

		mock.ExpectQuery(selectQuery).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows(OrganisationCols))

		e.GET(path).
			WithPath("organisation_id", "1").
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusNotFound)

		test.ExpectationsMet(t, mock)
	})

	t.Run("invalid organisation id", func(t *testing.T) {
		e.GET(path).
			WithPath("organisation_id", "abc").
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusNotFound)
	})
}
