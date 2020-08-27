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

func TestUpdateOrganisation(t *testing.T) {
	// Setup DB
	mock := test.SetupMockDB()

	// Setup HttpExpect
	router := action.RegisterRoutes()
	server := httptest.NewServer(router)
	defer server.Close()

	e := httpexpect.New(t, server.URL)

	t.Run("update organisation", func(t *testing.T) {
		mock.ExpectQuery(selectQuery).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows(OrganisationCols).
				AddRow(1, time.Now(), time.Now(), nil, "title"))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "organisation_users"`)).
			WithArgs(1, 1, "owner").
			WillReturnRows(sqlmock.NewRows(user.OrganisationUserCols).
				AddRow(1, time.Now(), time.Now(), nil, user.OrganisationUser["user_id"], user.OrganisationUser["organisation_id"], user.OrganisationUser["role"]))

		mock.ExpectBegin()
		mock.ExpectExec(`UPDATE \"organisations\" SET (.+)  WHERE (.+) \"organisations\".\"id\" = `).
			WithArgs(Organisation["title"], test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		mock.ExpectCommit()

		OrganisationSelectMock(mock)

		e.PUT(path).
			WithPath("organisation_id", "1").
			WithHeader("X-User", "1").
			WithJSON(Organisation).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(Organisation)

		test.ExpectationsMet(t, mock)
	})

	t.Run("record not found", func(t *testing.T) {
		mock.ExpectQuery(selectQuery).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows(OrganisationCols))

		e.PUT(path).
			WithPath("organisation_id", "1").
			WithHeader("X-User", "1").
			WithJSON(Organisation).
			Expect().
			Status(http.StatusNotFound)

		test.ExpectationsMet(t, mock)
	})

	t.Run("invalid organisation id", func(t *testing.T) {
		e.PUT(path).
			WithPath("organisation_id", "abc").
			WithHeader("X-User", "1").
			WithJSON(Organisation).
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("invalid organisation body", func(t *testing.T) {
		e.PUT(path).
			WithPath("organisation_id", "1").
			WithHeader("X-User", "1").
			WithJSON(invalidOrganisation).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("invalid user id header", func(t *testing.T) {
		e.PUT(path).
			WithPath("organisation_id", "1").
			WithHeader("X-User", "abc").
			WithJSON(Organisation).
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("user without role owner", func(t *testing.T) {
		mock.ExpectQuery(selectQuery).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows(OrganisationCols).
				AddRow(1, time.Now(), time.Now(), nil, "title"))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "organisation_users"`)).
			WithArgs(1, 1, "owner").
			WillReturnRows(sqlmock.NewRows(user.OrganisationUserCols))

		e.PUT(path).
			WithPath("organisation_id", "1").
			WithHeader("X-User", "1").
			WithJSON(Organisation).
			Expect().
			Status(http.StatusNotFound)

		test.ExpectationsMet(t, mock)
	})
}
