package user

import (
	"database/sql/driver"
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/test/medium"
	"github.com/factly/kavach-server/test/organisation/application"
	"github.com/factly/kavach-server/test/organisation/user"
	"github.com/factly/kavach-server/test/profile"
	"github.com/factly/kavach-server/util/test"
	"github.com/gavv/httpexpect"
)

func TestCreateApplicationUser(t *testing.T) {

	// Setup DB
	mock := test.SetupMockDB()

	// Setup HttpExpect
	router := action.RegisterRoutes()
	server := httptest.NewServer(router)
	defer server.Close()

	e := httpexpect.New(t, server.URL)

	t.Run("invalid user id header", func(t *testing.T) {
		e.POST(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
			}).
			WithHeader("X-User", "invalid").
			WithJSON(requestObject).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("invalid organisation id", func(t *testing.T) {
		e.POST(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "invalid",
				"application_id":  "1",
			}).
			WithHeader("X-User", "1").
			WithJSON(requestObject).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("invalid application id", func(t *testing.T) {
		e.POST(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "invalid",
			}).
			WithHeader("X-User", "1").
			WithJSON(requestObject).
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("invalid request object", func(t *testing.T) {
		e.POST(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
			}).
			WithHeader("X-User", "1").
			WithJSON(invalidObject).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("undecodable request object", func(t *testing.T) {
		e.POST(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
			}).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("user is not owner of organisation", func(t *testing.T) {
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "organisation_users"`)).
			WithArgs(1, 1, "owner").
			WillReturnRows(sqlmock.NewRows(user.OrganisationUserCols))

		e.POST(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
			}).
			WithHeader("X-User", "1").
			WithJSON(requestObject).
			Expect().
			Status(http.StatusUnauthorized)

		test.ExpectationsMet(t, mock)
	})

	t.Run("application record not found", func(t *testing.T) {
		user.OrganisationUserOwnerSelectMock(mock)

		mock.ExpectBegin()
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "applications"`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows(application.ApplicationCols))
		mock.ExpectRollback()

		e.POST(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
			}).
			WithHeader("X-User", "1").
			WithJSON(requestObject).
			Expect().
			Status(http.StatusNotFound)

		test.ExpectationsMet(t, mock)
	})

	t.Run("adding user is not part of organisation", func(t *testing.T) {
		user.OrganisationUserOwnerSelectMock(mock)

		mock.ExpectBegin()
		application.ApplicationSelectMock(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "application_users"`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"application_id", "user_id"}).AddRow(1, 1))

		profile.UserSelectMock(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "organisation_users"`)).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(user.OrganisationUserCols))

		mock.ExpectRollback()

		e.POST(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
			}).
			WithHeader("X-User", "1").
			WithJSON(requestObject).
			Expect().
			Status(http.StatusUnprocessableEntity)

		test.ExpectationsMet(t, mock)
	})

	t.Run("adding user to the application user association", func(t *testing.T) {
		user.OrganisationUserOwnerSelectMock(mock)

		mock.ExpectBegin()
		application.ApplicationSelectMock(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "application_users"`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"application_id", "user_id"}).AddRow(1, 1))

		profile.UserSelectMock(mock)

		user.OrganisationUserSelectMock(mock)

		profile.UserSelectMock(mock)
		medium.SelectQuery(mock)

		mock.ExpectQuery(`INSERT INTO "users"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 0, 0, profile.User["email"], profile.User["kid"], profile.User["first_name"], profile.User["last_name"], "", "", profile.User["birth_date"], profile.User["gender"], nil, "", 1, 1, test.AnyTime{}, test.AnyTime{}, nil, 0, 0, profile.User["email"], profile.User["kid"], profile.User["first_name"], profile.User["last_name"], "", "", profile.User["birth_date"], profile.User["gender"], nil, "", 1, 1).
			WillReturnRows(sqlmock.NewRows([]string{"id", "medium_id"}).AddRow(1, 1))

		mock.ExpectExec(`INSERT INTO "application_users"`).
			WithArgs(1, 1, 1, 1).
			WillReturnResult(driver.ResultNoRows)

		mock.ExpectExec(`DELETE FROM "application_users"`).
			WithArgs(1, 1).
			WillReturnResult(driver.ResultNoRows)
		mock.ExpectCommit()

		e.POST(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
			}).
			WithHeader("X-User", "1").
			WithJSON(requestObject).
			Expect().
			Status(http.StatusCreated)

		test.ExpectationsMet(t, mock)
	})
}
