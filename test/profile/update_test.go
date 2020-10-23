package profile

import (
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"
	"time"

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
				AddRow(1, time.Now(), time.Now(), nil, "email", "kid", "first_name", "last_name", "birth_date", "gender"))

		mock.ExpectBegin()
		mock.ExpectExec(`UPDATE \"users\" SET`).
			WithArgs(test.AnyTime{}, User["first_name"], User["last_name"], User["birth_date"], User["gender"], 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		mock.ExpectCommit()

		UserSelectMock(mock)

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
