package token

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/test/organisation/application"
	"github.com/factly/kavach-server/util/test"
	"github.com/gavv/httpexpect"
)

func TestValidateTokens(t *testing.T) {
	// Setup DB
	mock := test.SetupMockDB()

	// Setup HttpExpect
	router := action.RegisterRoutes()
	server := httptest.NewServer(router)
	defer server.Close()

	e := httpexpect.New(t, server.URL)

	t.Run("invalid token body", func(t *testing.T) {
		e.POST(validatePath).
			WithPathObject(map[string]interface{}{
				"application_slug": "dega",
			}).
			WithJSON(invalidValidateObject).
			WithHeader("X-Organisation", "1").
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("undecodable token body", func(t *testing.T) {
		e.POST(validatePath).
			WithPathObject(map[string]interface{}{
				"application_slug": "dega",
			}).
			WithHeader("X-Organisation", "1").
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("application token not found", func(t *testing.T) {
		mock.ExpectQuery(selectQuery).
			WithArgs("testaccesstoken").
			WillReturnRows(sqlmock.NewRows(application.ApplicationCols))

		e.POST(validatePath).
			WithPathObject(map[string]interface{}{
				"application_slug": "dega",
			}).
			WithJSON(ValidateObject).
			WithHeader("X-Organisation", "1").
			Expect().
			Status(http.StatusNotFound)
		test.ExpectationsMet(t, mock)
	})

	t.Run("validate application token", func(t *testing.T) {
		mock.ExpectQuery(selectQuery).
			WithArgs("testaccesstoken").
			WillReturnRows(sqlmock.NewRows(ApplicationTokenCols).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, ApplicationToken["name"], ApplicationToken["description"], 1, "testaccesstoken", "2c0f9835774c499584e27c1496ca533d"))

		application.ApplicationSelectMock(mock)

		e.POST(validatePath).
			WithPathObject(map[string]interface{}{
				"application_slug": "test-application",
			}).
			WithJSON(ValidateObject).
			WithHeader("X-Organisation", "1").
			Expect().
			Status(http.StatusOK)
		test.ExpectationsMet(t, mock)
	})

}
