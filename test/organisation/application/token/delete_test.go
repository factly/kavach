package token

import (
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/test/organisation/user"
	"github.com/factly/kavach-server/util/test"
	"github.com/gavv/httpexpect"
)

func TestDeleteApplicationToken(t *testing.T) {
	// Setup DB
	mock := test.SetupMockDB()

	// Setup HttpExpect
	router := action.RegisterRoutes()
	server := httptest.NewServer(router)
	defer server.Close()

	e := httpexpect.New(t, server.URL)

	t.Run("invalid organisation id", func(t *testing.T) {
		e.DELETE(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "invalid",
				"token_id":        "1",
				"application_id":  "1",
			}).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("invalid application id", func(t *testing.T) {
		e.DELETE(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"token_id":        "1",
				"application_id":  "invalid",
			}).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("invalid token id", func(t *testing.T) {
		e.DELETE(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"token_id":        "1",
				"application_id":  "invalid",
			}).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("user not owner of organisation", func(t *testing.T) {
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "organisation_users"`)).
			WithArgs(1, 1, "owner").
			WillReturnRows(sqlmock.NewRows(user.OrganisationUserCols))
		e.DELETE(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"token_id":        "1",
				"application_id":  "1",
			}).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusUnauthorized)

		test.ExpectationsMet(t, mock)
	})

	t.Run("application token record not found", func(t *testing.T) {

		user.OrganisationUserOwnerSelectMock(mock)
		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(ApplicationTokenCols))

		e.DELETE(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"token_id":        "1",
				"application_id":  "1",
			}).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusNotFound)

		test.ExpectationsMet(t, mock)
	})

	t.Run("delete application token", func(t *testing.T) {
		user.OrganisationUserOwnerSelectMock(mock)
		ApplicationTokenSelect(mock)

		mock.ExpectExec(regexp.QuoteMeta(`UPDATE "application_tokens" SET "deleted_at"=`)).
			WithArgs(test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))

		e.DELETE(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"token_id":        "1",
				"application_id":  "1",
			}).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusOK)

		test.ExpectationsMet(t, mock)
	})

}
