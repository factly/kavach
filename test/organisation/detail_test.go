package organisation

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

func TestDetailOrganisation(t *testing.T) {

	// Setup DB
	mock := test.SetupMockDB()

	// Setup HttpExpect
	router := action.RegisterRoutes()
	server := httptest.NewServer(router)
	defer server.Close()

	e := httpexpect.New(t, server.URL)

	t.Run("get organisation by id", func(t *testing.T) {
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "organisation_users"`)).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(user.OrganisationUserCols).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, "owner"))

		OrganisationSelectMock(mock)

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
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "organisation_users"`)).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "created_at", "updated_at", "deleted_at", "user_id", "organisation_id", "role"}).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, "owner"))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "organisations"`)).
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
