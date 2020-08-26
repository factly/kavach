package user

import (
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/test/profile"
	"github.com/factly/kavach-server/util/test"
	"github.com/gavv/httpexpect"
)

func TestCheckerUser(t *testing.T) {
	// Setup DB
	mock := test.SetupMockDB()

	// Setup HttpExpect
	router := action.RegisterRoutes()
	server := httptest.NewServer(router)
	defer server.Close()

	e := httpexpect.New(t, server.URL)

	t.Run("create user", func(t *testing.T) {

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "users"`)).
			WillReturnRows(sqlmock.NewRows(profile.UserCols))

		mock.ExpectBegin()
		mock.ExpectQuery(`INSERT INTO "users"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, "test@factly.in", "", "", "", "", "").
			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
		mock.ExpectCommit()

		e.POST(path).
			WithHeader("X-User", "1").
			WithBytes(jsonStr).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			Value("extra").
			Object().
			Value("identity").
			Object().
			Value("traits").
			Object().
			Value("email").
			String().
			Equal("test@factly.in")
	})
}
