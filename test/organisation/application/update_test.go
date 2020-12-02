package application

import (
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/test/medium"
	"github.com/factly/kavach-server/test/organisation/user"
	"github.com/factly/kavach-server/util/test"
	"github.com/gavv/httpexpect"
)

func TestUpdateApplication(t *testing.T) {
	// Setup DB
	mock := test.SetupMockDB()

	// Setup HttpExpect
	router := action.RegisterRoutes()
	server := httptest.NewServer(router)
	defer server.Close()

	e := httpexpect.New(t, server.URL)

	t.Run("invalid organisation id", func(t *testing.T) {
		e.PUT(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "invalid",
				"application_id":  "1",
			}).
			WithHeader("X-User", "1").
			WithJSON(Application).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("invalid user id header", func(t *testing.T) {
		e.PUT(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
			}).
			WithHeader("X-User", "invalid").
			WithJSON(Application).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("invalid application id header", func(t *testing.T) {
		e.PUT(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "invalid",
			}).
			WithHeader("X-User", "1").
			WithJSON(Application).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("undecodable application", func(t *testing.T) {
		e.PUT(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
			}).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("invalid application object", func(t *testing.T) {
		e.PUT(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
			}).
			WithHeader("X-User", "1").
			WithJSON(invalidApplication).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("application record not found", func(t *testing.T) {
		mock.ExpectQuery(selectQuery).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(ApplicationCols))

		e.PUT(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
			}).
			WithHeader("X-User", "1").
			WithJSON(Application).
			Expect().
			Status(http.StatusNotFound)

		test.ExpectationsMet(t, mock)
	})

	t.Run("user not owner of organisation", func(t *testing.T) {
		ApplicationSelectMock(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "organisation_users"`)).
			WithArgs(1, 1, "owner").
			WillReturnRows(sqlmock.NewRows(user.OrganisationUserCols))

		e.PUT(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
			}).
			WithHeader("X-User", "1").
			WithJSON(Application).
			Expect().
			Status(http.StatusUnauthorized)

		test.ExpectationsMet(t, mock)
	})

	t.Run("medium does not belong to user", func(t *testing.T) {
		ApplicationSelectMock(mock)
		user.OrganisationUserOwnerSelectMock(mock)

		mock.ExpectBegin()
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "media"`)).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(mediumCols))
		mock.ExpectRollback()

		e.PUT(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
			}).
			WithHeader("X-User", "1").
			WithJSON(Application).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})

	t.Run("update a application", func(t *testing.T) {
		ApplicationSelectMock(mock)
		user.OrganisationUserOwnerSelectMock(mock)

		mock.ExpectBegin()
		medium.SelectQuery(mock, 1, 1)
		mock.ExpectExec(`UPDATE \"applications\" SET`).
			WithArgs(test.AnyTime{}, 1, Application["name"], Application["description"], Application["url"], Application["medium_id"], 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		ApplicationSelectMock(mock, 1, 1)
		medium.SelectQuery(mock, 1)
		mock.ExpectCommit()

		e.PUT(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
			}).
			WithHeader("X-User", "1").
			WithJSON(Application).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(Application)

		test.ExpectationsMet(t, mock)
	})

	t.Run("update a application when medium_id = 0", func(t *testing.T) {
		ApplicationSelectMock(mock)
		Application["medium_id"] = nil
		user.OrganisationUserOwnerSelectMock(mock)

		mock.ExpectBegin()
		mock.ExpectExec(`UPDATE \"applications\" SET`).
			WithArgs(nil, test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		mock.ExpectExec(`UPDATE \"applications\" SET`).
			WithArgs(test.AnyTime{}, 1, Application["name"], Application["description"], Application["url"], 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		ApplicationSelectMock(mock, 1, 1)
		mock.ExpectCommit()

		e.PUT(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
			}).
			WithHeader("X-User", "1").
			WithJSON(Application).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(Application)
		Application["medium_id"] = 1
		test.ExpectationsMet(t, mock)
	})

}
