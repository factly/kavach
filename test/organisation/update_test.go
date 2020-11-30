package organisation

import (
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"
	"time"

	"github.com/factly/kavach-server/test/medium"

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
				AddRow(1, time.Now(), time.Now(), nil, "title", "slug", "description", 1))

		user.OrganisationUserOwnerSelectMock(mock)

		mock.ExpectBegin()
		medium.SelectQuery(mock)
		mock.ExpectExec(`UPDATE \"organisations\" SET`).
			WithArgs(test.AnyTime{}, Organisation["title"], Organisation["slug"], Organisation["description"], Organisation["featured_medium_id"], 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		OrganisationSelectMock(mock, 1, 1)
		medium.SelectQuery(mock)
		mock.ExpectCommit()

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

	t.Run("update organisation when featured_medium_id = 0", func(t *testing.T) {
		Organisation["featured_medium_id"] = 0
		mock.ExpectQuery(selectQuery).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows(OrganisationCols).
				AddRow(1, time.Now(), time.Now(), nil, "title", "slug", "description", 1))

		user.OrganisationUserOwnerSelectMock(mock)

		mock.ExpectBegin()
		mock.ExpectExec(`UPDATE \"organisations\" SET`).
			WithArgs(nil, test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		OrganisationSelectMock(mock, 1, 1)
		mock.ExpectExec(`UPDATE \"organisations\" SET`).
			WithArgs(test.AnyTime{}, Organisation["title"], Organisation["slug"], Organisation["description"], 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		OrganisationSelectMock(mock, 1, 1)
		medium.SelectQuery(mock)
		mock.ExpectCommit()

		e.PUT(path).
			WithPath("organisation_id", "1").
			WithHeader("X-User", "1").
			WithJSON(Organisation).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(Organisation)
		Organisation["featured_medium_id"] = 1
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
			Status(http.StatusBadRequest)
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
			Status(http.StatusBadRequest)
	})

	t.Run("user without role owner", func(t *testing.T) {
		mock.ExpectQuery(selectQuery).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows(OrganisationCols).
				AddRow(1, time.Now(), time.Now(), nil, "title", "slug", "description", 1))

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
