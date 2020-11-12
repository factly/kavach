package medium

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/util/test"
	"github.com/gavv/httpexpect"
)

func TestMediumDetails(t *testing.T) {
	mock := test.SetupMockDB()

	router := action.RegisterRoutes()
	server := httptest.NewServer(router)
	defer server.Close()

	// create httpexpect instance
	e := httpexpect.New(t, server.URL)

	t.Run("invalid medium id", func(t *testing.T) {
		e.GET(path).
			WithPath("medium_id", "invalid_id").
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("invalid user id header", func(t *testing.T) {
		e.GET(path).
			WithPath("medium_id", "1").
			WithHeader("X-User", "invalid").
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("medium record not found", func(t *testing.T) {
		mock.ExpectQuery(selectQuery).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(columns))

		e.GET(path).
			WithPath("medium_id", "1").
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusNotFound)
		test.ExpectationsMet(t, mock)
	})

	t.Run("get medium by id", func(t *testing.T) {
		SelectQuery(mock, 1, 1)
		e.GET(path).
			WithPath("medium_id", "1").
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusOK)
		test.ExpectationsMet(t, mock)
	})
}
