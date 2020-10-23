package organisation

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/test/organisation/user"
	"github.com/factly/kavach-server/util/test"
	"github.com/gavv/httpexpect"
)

func TestListOrganisation(t *testing.T) {

	// Setup DB
	mock := test.SetupMockDB()

	// Setup HttpExpect
	router := action.RegisterRoutes()
	server := httptest.NewServer(router)
	defer server.Close()

	e := httpexpect.New(t, server.URL)

	t.Run("get all organisation", func(t *testing.T) {
		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "organisation_users"`)).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows(user.OrganisationUserCols).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, "owner").
				AddRow(2, time.Now(), time.Now(), nil, 1, 1, "owner"))

		OrganisationSelectMock(mock,1)

		e.GET(fmt.Sprint(basePath, "/my")).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusOK).
			JSON().
			Array().
			Length().
			Equal(2)

		test.ExpectationsMet(t, mock)
	})

	t.Run("Invalid header", func(t *testing.T) {
		e.GET(fmt.Sprint(basePath, "/my")).
			WithHeader("X-User", "abc").
			Expect().
			Status(http.StatusBadRequest)
	})
}
