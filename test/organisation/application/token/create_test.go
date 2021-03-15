package token

import (
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/test/organisation/application"
	"github.com/factly/kavach-server/test/organisation/user"
	"github.com/factly/kavach-server/test/profile"
	"github.com/factly/kavach-server/util/test"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestCreateApplicationToken(t *testing.T) {

	// Setup DB
	mock := test.SetupMockDB()
	_ = test.MockServer()
	defer gock.DisableNetworking()

	// Setup HttpExpect
	router := action.RegisterRoutes()
	server := httptest.NewServer(router)
	gock.New(server.URL).EnableNetworking().Persist()
	defer server.Close()

	e := httpexpect.New(t, server.URL)

	t.Run("invalid organisation id", func(t *testing.T) {
		e.POST(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "invalid",
				"application_id":  "1",
			}).
			WithJSON(ApplicationToken).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("invalid application id", func(t *testing.T) {
		e.POST(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "invalid",
			}).
			WithJSON(ApplicationToken).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("invalid application body", func(t *testing.T) {
		e.POST(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
			}).
			WithJSON(invalidApplicationToken).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("undecodable application body", func(t *testing.T) {
		e.POST(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
			}).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("user not owner of organisation", func(t *testing.T) {
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "organisation_users"`)).
			WithArgs(1, 1, "owner").
			WillReturnRows(sqlmock.NewRows(user.OrganisationUserCols))

		e.POST(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
			}).
			WithJSON(ApplicationToken).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusUnauthorized)
		test.ExpectationsMet(t, mock)
	})

	t.Run("application record not found", func(t *testing.T) {
		user.OrganisationUserOwnerSelectMock(mock)
		profile.UserSelectMock(mock)

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "applications"`)).
			WillReturnRows(sqlmock.NewRows(application.ApplicationCols))

		e.POST(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
			}).
			WithJSON(ApplicationToken).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusNotFound)
		test.ExpectationsMet(t, mock)
	})

	t.Run("create application token", func(t *testing.T) {
		user.OrganisationUserOwnerSelectMock(mock)
		profile.UserSelectMock(mock)

		application.ApplicationSelectMock(mock)

		mock.ExpectQuery(`INSERT INTO "application_tokens"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 0, 0, ApplicationToken["name"], ApplicationToken["description"], 1, sqlmock.AnyArg(), sqlmock.AnyArg()).
			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))

		e.POST(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
			}).
			WithJSON(ApplicationToken).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusCreated)
		test.ExpectationsMet(t, mock)
	})

	t.Run("getting kratos identity fails", func(t *testing.T) {
		gock.Off()
		user.OrganisationUserOwnerSelectMock(mock)
		profile.UserSelectMock(mock)

		application.ApplicationSelectMock(mock)

		e.POST(basePath).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"application_id":  "1",
			}).
			WithJSON(ApplicationToken).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})

}
