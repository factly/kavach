package user

import (
	"log"
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/util/test"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestDeleteOrganisationUser(t *testing.T) {
	// Setup DB
	mock := test.SetupMockDB()

	defer gock.Disable()
	err := test.MockServer()
	if err != nil {
		log.Fatal(err)
	}
	defer gock.DisableNetworking()

	// Setup HttpExpect
	router := action.RegisterRoutes()
	server := httptest.NewServer(router)
	defer server.Close()

	gock.New(server.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()

	e := httpexpect.New(t, server.URL)

	t.Run("delete organisation member user", func(t *testing.T) {
		mock.ExpectQuery(selectQuery).
			WithArgs(2, 1, "owner").
			WillReturnRows(sqlmock.NewRows(OrganisationUserCols).
				AddRow(1, time.Now(), time.Now(), nil, OrganisationUser["user_id"], OrganisationUser["organisation_id"], OrganisationUser["role"]))

		mock.ExpectQuery(selectQuery).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(OrganisationUserCols).
				AddRow(1, time.Now(), time.Now(), nil, OrganisationUser["user_id"], OrganisationUser["organisation_id"], "member"))

		mock.ExpectQuery(countQuery).
			WithArgs(1, "owner").
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))

		mock.ExpectBegin()
		mock.ExpectExec(regexp.QuoteMeta(`UPDATE "organisation_users" SET "deleted_at"=`)).
			WithArgs(test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		mock.ExpectCommit()

		e.DELETE(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"user_id":         "1",
			}).
			WithHeader("X-User", "2").
			Expect().
			Status(http.StatusOK)

		test.ExpectationsMet(t, mock)
	})

	t.Run("delete organisation owner user", func(t *testing.T) {
		mock.ExpectQuery(selectQuery).
			WithArgs(2, 1, "owner").
			WillReturnRows(sqlmock.NewRows(OrganisationUserCols).
				AddRow(1, time.Now(), time.Now(), nil, OrganisationUser["user_id"], OrganisationUser["organisation_id"], OrganisationUser["role"]))

		mock.ExpectQuery(selectQuery).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(OrganisationUserCols).
				AddRow(1, time.Now(), time.Now(), nil, OrganisationUser["user_id"], OrganisationUser["organisation_id"], "owner"))

		mock.ExpectQuery(countQuery).
			WithArgs(1, "owner").
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(2))

		mock.ExpectBegin()
		mock.ExpectExec(regexp.QuoteMeta(`UPDATE "organisation_users" SET "deleted_at"=`)).
			WithArgs(test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		mock.ExpectCommit()

		e.DELETE(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"user_id":         "1",
			}).
			WithHeader("X-User", "2").
			Expect().
			Status(http.StatusOK)

		test.ExpectationsMet(t, mock)
	})

	t.Run("user is not owner of organisation", func(t *testing.T) {
		mock.ExpectQuery(selectQuery).
			WithArgs(2, 1, "owner").
			WillReturnRows(sqlmock.NewRows(OrganisationUserCols))

		e.DELETE(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"user_id":         "1",
			}).
			WithHeader("X-User", "2").
			Expect().
			Status(http.StatusUnprocessableEntity)

		test.ExpectationsMet(t, mock)
	})

	t.Run("user not found in organisation", func(t *testing.T) {
		mock.ExpectQuery(selectQuery).
			WithArgs(2, 1, "owner").
			WillReturnRows(sqlmock.NewRows(OrganisationUserCols).
				AddRow(1, time.Now(), time.Now(), nil, OrganisationUser["user_id"], OrganisationUser["organisation_id"], OrganisationUser["role"]))

		mock.ExpectQuery(selectQuery).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(OrganisationUserCols))

		e.DELETE(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"user_id":         "1",
			}).
			WithHeader("X-User", "2").
			Expect().
			Status(http.StatusNotFound)

		test.ExpectationsMet(t, mock)
	})

	t.Run("invalid organisation id", func(t *testing.T) {
		e.DELETE(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "abc",
				"user_id":         "1",
			}).
			WithHeader("X-User", "2").
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("invalid user id", func(t *testing.T) {
		mock.ExpectQuery(selectQuery).
			WithArgs(2, 1, "owner").
			WillReturnRows(sqlmock.NewRows(OrganisationUserCols).
				AddRow(1, time.Now(), time.Now(), nil, OrganisationUser["user_id"], OrganisationUser["organisation_id"], OrganisationUser["role"]))

		e.DELETE(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"user_id":         "abc",
			}).
			WithHeader("X-User", "2").
			Expect().
			Status(http.StatusNotFound)

		test.ExpectationsMet(t, mock)
	})

	t.Run("invalid user id header", func(t *testing.T) {
		e.DELETE(path).
			WithPathObject(map[string]interface{}{
				"organisation_id": "1",
				"user_id":         "1",
			}).
			WithHeader("X-User", "abc").
			Expect().
			Status(http.StatusInternalServerError)
	})
}
