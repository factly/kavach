package medium

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/util/test"
	"github.com/gavv/httpexpect"
	"github.com/jinzhu/gorm/dialects/postgres"
)

func TestMediumUpdate(t *testing.T) {
	mock := test.SetupMockDB()

	router := action.RegisterRoutes()
	server := httptest.NewServer(router)
	defer server.Close()

	// create httpexpect instance
	e := httpexpect.New(t, server.URL)

	t.Run("invalid user id header", func(t *testing.T) {
		e.PUT(path).
			WithPath("medium_id", "1").
			WithHeader("X-User", "invalid").
			WithJSON(Data).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("invalid medium id", func(t *testing.T) {
		e.PUT(path).
			WithPath("medium_id", "invalid").
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("undecodable medium data", func(t *testing.T) {
		e.PUT(path).
			WithPath("medium_id", "1").
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("invalid medium data", func(t *testing.T) {
		e.PUT(path).
			WithPath("medium_id", "1").
			WithHeader("X-User", "1").
			WithJSON(invalidData).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("medium record not found", func(t *testing.T) {
		mock.ExpectQuery(selectQuery).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(columns))

		e.PUT(path).
			WithPath("medium_id", "1").
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusNotFound)
		test.ExpectationsMet(t, mock)
	})

	t.Run("update medium", func(t *testing.T) {
		mock.ExpectQuery(selectQuery).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(columns).
				AddRow(1, time.Now(), time.Now(), nil, "name", "slug", "type", "title", "description", "caption", "alt_text", 100, postgres.Jsonb{}, "dimensions", 1))

		mock.ExpectBegin()
		mock.ExpectExec(`UPDATE \"media\"`).
			WithArgs(test.AnyTime{}, Data["name"], Data["slug"], Data["type"], Data["title"], Data["description"], Data["caption"], Data["alt_text"], Data["file_size"], Data["url"], Data["dimensions"], 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		mock.ExpectCommit()

		SelectQuery(mock, 1, 1)

		e.PUT(path).
			WithPath("medium_id", "1").
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusOK)
		test.ExpectationsMet(t, mock)
	})

	t.Run("updating medium failed", func(t *testing.T) {
		mock.ExpectQuery(selectQuery).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(columns).
				AddRow(1, time.Now(), time.Now(), nil, "name", "slug", "type", "title", "description", "caption", "alt_text", 100, postgres.Jsonb{}, "dimensions", 1))

		mock.ExpectBegin()
		mock.ExpectExec(`UPDATE \"media\"`).
			WithArgs(test.AnyTime{}, Data["name"], Data["slug"], Data["type"], Data["title"], Data["description"], Data["caption"], Data["alt_text"], Data["file_size"], Data["url"], Data["dimensions"], 1).
			WillReturnError(errors.New("updating medium failed"))
		mock.ExpectRollback()

		e.PUT(path).
			WithPath("medium_id", "1").
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})
}
