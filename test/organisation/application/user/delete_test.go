package user

import (
	"database/sql/driver"
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/test/medium"
	"github.com/factly/kavach-server/test/organisation/application"
	"github.com/factly/kavach-server/test/organisation/user"
	"github.com/factly/kavach-server/test/profile"
	"github.com/factly/kavach-server/util/test"
	"github.com/gavv/httpexpect"
)

func TestDeleteApplicationUser(t *testing.T) {
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
				"application_id":  "1",
			}).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("invalid user id", func(t *testing.T) {
		e.DELETE(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
				"user_id":         "invalid",
			}).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("invalid organisation id", func(t *testing.T) {
		e.DELETE(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "invalid",
				"application_id":  "1",
				"user_id":         "1",
			}).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("invalid user id header", func(t *testing.T) {
		e.DELETE(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
				"user_id":         "1",
			}).
			WithHeader("X-User", "invalid").
			Expect().
			Status(http.StatusInternalServerError)
	})

	t.Run("invalid application id", func(t *testing.T) {
		e.DELETE(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "invalid",
				"user_id":         "1",
			}).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("logged in user is not owner", func(t *testing.T) {
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "organisation_users"`)).
			WithArgs(1, 1, "owner").
			WillReturnRows(sqlmock.NewRows(user.OrganisationUserCols))

		e.DELETE(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
				"user_id":         "1",
			}).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusUnprocessableEntity)

		test.ExpectationsMet(t, mock)
	})

	t.Run("application record not found", func(t *testing.T) {
		user.OrganisationUserOwnerSelectMock(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "applications"`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows(application.ApplicationCols))

		e.DELETE(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
				"user_id":         "1",
			}).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusNotFound)

		test.ExpectationsMet(t, mock)
	})

	t.Run("user not found in application", func(t *testing.T) {
		user.OrganisationUserOwnerSelectMock(mock)

		application.ApplicationSelectMock(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "application_users"`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"application_id", "user_id"}).AddRow(1, 2))

		profile.UserSelectMock(mock)

		e.DELETE(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
				"user_id":         "1",
			}).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusNotFound)

		test.ExpectationsMet(t, mock)
	})

	t.Run("deleting last user from application", func(t *testing.T) {
		user.OrganisationUserOwnerSelectMock(mock)

		application.ApplicationSelectMock(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "application_users"`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"application_id", "user_id"}).AddRow(1, 1))

		profile.UserSelectMock(mock)

		e.DELETE(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
				"user_id":         "1",
			}).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusUnprocessableEntity)

		test.ExpectationsMet(t, mock)
	})

	t.Run("delete a application user", func(t *testing.T) {
		user.OrganisationUserOwnerSelectMock(mock)

		application.ApplicationSelectMock(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "application_users"`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows([]string{"application_id", "user_id"}).AddRow(1, 1).AddRow(1, 2))

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "users"`)).
			WillReturnRows(sqlmock.NewRows(profile.UserCols).
				AddRow(1, time.Now(), time.Now(), nil, profile.User["email"], profile.User["kid"], profile.User["first_name"], profile.User["last_name"], profile.User["birth_date"], profile.User["gender"], profile.User["featured_medium_id"]).
				AddRow(2, time.Now(), time.Now(), nil, profile.User["email"], profile.User["kid"], profile.User["first_name"], profile.User["last_name"], profile.User["birth_date"], profile.User["gender"], profile.User["featured_medium_id"]))

		medium.SelectQuery(mock)
		mock.ExpectQuery(`INSERT INTO "users"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 0, 0, profile.User["email"], profile.User["kid"], profile.User["first_name"], profile.User["last_name"], "", "", profile.User["birth_date"], profile.User["gender"], nil, "", sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows([]string{"id", "medium_id"}).AddRow(1, 1))

		mock.ExpectExec(`INSERT INTO "application_users"`).
			WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnResult(driver.ResultNoRows)

		mock.ExpectExec(`DELETE FROM "application_users"`).
			WithArgs(1, 2).
			WillReturnResult(driver.ResultNoRows)

		e.DELETE(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
				"user_id":         "1",
			}).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusOK)

		test.ExpectationsMet(t, mock)
	})
}
