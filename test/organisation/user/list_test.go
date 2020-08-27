package user

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/test/profile"
	"github.com/factly/kavach-server/util/test"
	"github.com/gavv/httpexpect"
)

func TestListOrganisationUsers(t *testing.T) {

	// Setup DB
	mock := test.SetupMockDB()

	// Setup HttpExpect
	router := action.RegisterRoutes()
	server := httptest.NewServer(router)
	defer server.Close()

	e := httpexpect.New(t, server.URL)

	t.Run("get organisation users list", func(t *testing.T) {
		OrganisationUserSelectMock(mock)

		mock.ExpectQuery(selectQuery).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows(OrganisationUserCols).
				AddRow(1, time.Now(), time.Now(), nil, organisationuserlist[0]["user_id"], organisationuserlist[0]["organisation_id"], organisationuserlist[0]["role"]).
				AddRow(2, time.Now(), time.Now(), nil, organisationuserlist[1]["user_id"], organisationuserlist[1]["organisation_id"], organisationuserlist[1]["role"]))

		profile.UserSelectMock(mock)

		e.GET(basePath).
			WithHeader("X-User", "1").
			WithPath("organisation_id", "1").
			Expect().
			Status(http.StatusOK).
			JSON().
			Array().
			Length().
			Equal(len(organisationuserlist))

		test.ExpectationsMet(t, mock)
	})

	t.Run("Invalid organisation id", func(t *testing.T) {
		e.GET(basePath).
			WithHeader("X-User", "1").
			WithPath("organisation_id", "abc").
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("Invalid user id", func(t *testing.T) {
		mock.ExpectQuery(selectQuery).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows(OrganisationUserCols))

		e.GET(basePath).
			WithHeader("X-User", "abc").
			WithPath("organisation_id", "1").
			Expect().
			Status(http.StatusNotFound)
	})
}
