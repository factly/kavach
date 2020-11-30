package medium

import (
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/util/test"
	"github.com/gavv/httpexpect"
)

func TestMediumDelete(t *testing.T) {
	mock := test.SetupMockDB()

	router := action.RegisterRoutes()
	server := httptest.NewServer(router)
	defer server.Close()

	// create httpexpect instance
	e := httpexpect.New(t, server.URL)

	t.Run("invalid user id header", func(t *testing.T) {
		e.DELETE(path).
			WithPath("medium_id", "1").
			WithHeader("X-User", "invalid").
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("invalid medium id", func(t *testing.T) {
		e.DELETE(path).
			WithPath("medium_id", "invalid").
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("medium record not found", func(t *testing.T) {
		mock.ExpectQuery(selectQuery).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(columns))

		e.DELETE(path).
			WithPath("medium_id", "1").
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusNotFound)
		test.ExpectationsMet(t, mock)
	})

	t.Run("medium associated with user", func(t *testing.T) {
		SelectQuery(mock, 1, 1)

		userMediumCount(mock, 1)

		e.DELETE(path).
			WithPath("medium_id", "1").
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("medium associated with organisation", func(t *testing.T) {
		SelectQuery(mock, 1, 1)

		userMediumCount(mock, 0)

		organisationMediumCount(mock, 1)

		e.DELETE(path).
			WithPath("medium_id", "1").
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("medium record deleted", func(t *testing.T) {
		SelectQuery(mock, 1, 1)

		userMediumCount(mock, 0)

		organisationMediumCount(mock, 0)

		mock.ExpectBegin()
		mock.ExpectExec(regexp.QuoteMeta(`UPDATE "media" SET "deleted_at"=`)).
			WithArgs(test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		mock.ExpectCommit()

		e.DELETE(path).
			WithPath("medium_id", "1").
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusOK)
		test.ExpectationsMet(t, mock)
	})
}
