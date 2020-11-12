package medium

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/util/test"
	"github.com/gavv/httpexpect"
)

func TestMediumCreate(t *testing.T) {
	mock := test.SetupMockDB()

	router := action.RegisterRoutes()
	server := httptest.NewServer(router)
	defer server.Close()

	// create httpexpect instance
	e := httpexpect.New(t, server.URL)

	t.Run("invalid user id header", func(t *testing.T) {
		e.POST(basePath).
			WithHeader("X-User", "invalid").
			WithJSON(Data).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("Undecodable medium", func(t *testing.T) {
		e.POST(basePath).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusUnprocessableEntity)

	})

	t.Run("Invalid medium", func(t *testing.T) {
		e.POST(basePath).
			WithHeader("X-User", "1").
			WithJSON(invalidData).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("create medium", func(t *testing.T) {
		mock.ExpectBegin()
		mock.ExpectQuery(`INSERT INTO "media"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Data["name"], Data["slug"], Data["type"], Data["title"], Data["description"], Data["caption"], Data["alt_text"], Data["file_size"], Data["url"], Data["dimensions"], 1).
			WillReturnRows(sqlmock.
				NewRows([]string{"id"}).
				AddRow(1))
		mock.ExpectCommit()

		e.POST(basePath).
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated)
		test.ExpectationsMet(t, mock)
	})

	t.Run("error while insert in db", func(t *testing.T) {
		mock.ExpectBegin()
		mock.ExpectQuery(`INSERT INTO "media"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Data["name"], Data["slug"], Data["type"], Data["title"], Data["description"], Data["caption"], Data["alt_text"], Data["file_size"], Data["url"], Data["dimensions"], 1).
			WillReturnError(errors.New("cannot insert into db"))
		mock.ExpectRollback()

		e.POST(basePath).
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})
}
