package profile

import (
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"
	"time"

	"github.com/factly/kavach-server/test/medium"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/util/test"
	"github.com/gavv/httpexpect"
)

func TestUpdateProfile(t *testing.T) {

	// Setup DB
	mock := test.SetupMockDB()

	// Setup HttpExpect
	router := action.RegisterRoutes()
	server := httptest.NewServer(router)
	defer server.Close()

	e := httpexpect.New(t, server.URL)

	t.Run("update profile", func(t *testing.T) {
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "users"`)).
			WillReturnRows(sqlmock.NewRows(UserCols).
				AddRow(1, time.Now(), time.Now(), nil, "email", "kid", "first_name", "last_name", "birth_date", "gender", 1))

		mock.ExpectBegin()
		medium.SelectQuery(mock)
		mock.ExpectExec(`UPDATE \"users\" SET`).
			WithArgs(1, test.AnyTime{}, User["first_name"], User["last_name"], User["birth_date"], User["gender"], User["featured_medium_id"], 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		UserSelectMock(mock)
		medium.SelectQuery(mock)
		mock.ExpectCommit()

		e.PUT(path).
			WithHeader("X-User", "1").
			WithJSON(User).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(User)

		test.ExpectationsMet(t, mock)
	})

	t.Run("update profile when featured_medium_id = 0", func(t *testing.T) {
		User["featured_medium_id"] = nil

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "users"`)).
			WillReturnRows(sqlmock.NewRows(UserCols).
				AddRow(1, time.Now(), time.Now(), nil, "email", "kid", "first_name", "last_name", "birth_date", "gender", 1))

		mock.ExpectBegin()
		mock.ExpectExec(`UPDATE \"users\" SET`).
			WithArgs(nil, test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		UserSelectMock(mock)
		mock.ExpectExec(`UPDATE \"users\" SET`).
			WithArgs(1, test.AnyTime{}, User["first_name"], User["last_name"], User["birth_date"], User["gender"], 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		UserSelectMock(mock)
		mock.ExpectCommit()

		e.PUT(path).
			WithHeader("X-User", "1").
			WithJSON(User).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(User)
		User["featured_medium_id"] = 1
		test.ExpectationsMet(t, mock)
	})

	t.Run("profile record not found", func(t *testing.T) {
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "users"`)).
			WillReturnRows(sqlmock.NewRows(UserCols))

		e.PUT(path).
			WithHeader("X-User", "1").
			WithJSON(User).
			Expect().
			Status(http.StatusNotFound)

		test.ExpectationsMet(t, mock)
	})

	t.Run("invalid header", func(t *testing.T) {
		e.PUT(path).
			WithHeader("X-User", "abc").
			WithJSON(User).
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("undecodable user body", func(t *testing.T) {
		e.PUT(path).
			WithHeader("X-User", "1").
			WithJSON(undecodableUser).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})
}
