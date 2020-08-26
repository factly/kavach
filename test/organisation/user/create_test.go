package user

import (
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/test/profile"
	"github.com/factly/kavach-server/util/test"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestCreateOrganisationUser(t *testing.T) {
	// Setup DB
	mock := test.SetupMockDB()

	// Setup HttpExpect
	router := action.RegisterRoutes()
	server := httptest.NewServer(router)
	defer server.Close()

	defer gock.Off()

	e := httpexpect.New(t, server.URL)

	t.Run("create organisation user", func(t *testing.T) {
		mock.ExpectQuery(selectQuery).
			WithArgs(1, 1, "owner").
			WillReturnRows(sqlmock.NewRows(OrganisationUserCols).
				AddRow(1, time.Now(), time.Now(), nil, OrganisationUser["user_id"], OrganisationUser["organisation_id"], OrganisationUser["role"]))

		mock.ExpectBegin()

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "users"`)).
			WillReturnRows(sqlmock.NewRows(profile.UserCols))

		mock.ExpectQuery(`INSERT INTO "users"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Invite["email"], "", "", "", "", "").
			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))

		mock.ExpectQuery(countQuery).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(0))

		mock.ExpectQuery(`INSERT INTO "organisation_users"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, OrganisationUser["user_id"], OrganisationUser["organisation_id"], OrganisationUser["role"]).
			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
		mock.ExpectCommit()

		res := e.POST(basePath).
			WithPath("organisation_id", "1").
			WithHeader("X-User", "1").
			WithJSON(Invite).
			Expect().
			Status(http.StatusCreated).
			JSON().
			Object()

		res.Value("email").
			String().
			Equal(Invite["email"].(string))

		res.Value("permission").
			Object().
			ContainsMap(OrganisationUser)

		test.ExpectationsMet(t, mock)
	})

	t.Run("user is not an owner", func(t *testing.T) {
		mock.ExpectQuery(selectQuery).
			WithArgs(1, 1, "owner").
			WillReturnRows(sqlmock.NewRows(OrganisationUserCols))

		e.POST(basePath).
			WithPath("organisation_id", "1").
			WithHeader("X-User", "1").
			WithJSON(Invite).
			Expect().
			Status(http.StatusUnprocessableEntity)

		test.ExpectationsMet(t, mock)
	})

	t.Run("add already present user", func(t *testing.T) {
		mock.ExpectQuery(selectQuery).
			WithArgs(1, 1, "owner").
			WillReturnRows(sqlmock.NewRows(OrganisationUserCols).
				AddRow(1, time.Now(), time.Now(), nil, OrganisationUser["user_id"], OrganisationUser["organisation_id"], OrganisationUser["role"]))

		mock.ExpectBegin()

		mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "users"`)).
			WillReturnRows(sqlmock.NewRows(profile.UserCols))

		mock.ExpectQuery(`INSERT INTO "users"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Invite["email"], "", "", "", "", "").
			WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))

		mock.ExpectQuery(countQuery).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))
		mock.ExpectRollback()

		e.POST(basePath).
			WithPath("organisation_id", "1").
			WithHeader("X-User", "1").
			WithJSON(Invite).
			Expect().
			Status(http.StatusUnprocessableEntity)

		test.ExpectationsMet(t, mock)
	})

	t.Run("invalid organisation id", func(t *testing.T) {
		e.POST(basePath).
			WithPath("organisation_id", "abc").
			WithHeader("X-User", "1").
			WithJSON(Invite).
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("invalid user id", func(t *testing.T) {
		e.POST(basePath).
			WithPath("organisation_id", "1").
			WithHeader("X-User", "abc").
			WithJSON(Invite).
			Expect().
			Status(http.StatusInternalServerError)
	})

	gock.New("http://keto.com").
		Put("/engines/acp/ory/regex/roles/roles:org:1:admin/members").
		MatchType("json").
		JSON(map[string]interface{}{"members": []string{"1"}}).
		Reply(http.StatusOK)
}
