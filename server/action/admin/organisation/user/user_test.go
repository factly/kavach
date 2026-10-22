package user

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"regexp"
	"strings"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/util/test"
	"github.com/factly/x/loggerx"
	"github.com/go-chi/chi"
	"github.com/spf13/viper"
)

var orgUserCols = []string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "user_id", "organisation_id", "role"}

var (
	selectOrgUser   = regexp.QuoteMeta(`SELECT * FROM "organisation_users" WHERE "organisation_users"."user_id" = $1 AND "organisation_users"."organisation_id" = $2`)
	selectOwnerIDs  = regexp.QuoteMeta(`SELECT "id" FROM "organisation_users" WHERE "organisation_users"."organisation_id" = $1 AND "organisation_users"."role" = $2`)
	updateRole      = regexp.QuoteMeta(`UPDATE "organisation_users" SET "role"=$1`)
	selectOrg       = regexp.QuoteMeta(`SELECT * FROM "organisations" WHERE "organisations"."id" = $1`)
	selectUser      = regexp.QuoteMeta(`SELECT * FROM "users" WHERE "users"."email" = $1`)
	countOrgUser    = regexp.QuoteMeta(`SELECT count(*) FROM "organisation_users"`)
	insertOrgUser   = regexp.QuoteMeta(`INSERT INTO "organisation_users"`)
	ketoCallsRecord = func(r *http.Request) string {
		if r.Method == http.MethodPut {
			tuple := map[string]interface{}{}
			_ = json.NewDecoder(r.Body).Decode(&tuple)
			return "PUT " + tuple["object"].(string) + "#" + tuple["relation"].(string) + "@" + tuple["subject_id"].(string)
		}
		q := r.URL.Query()
		return r.Method + " " + q.Get("object") + "#" + q.Get("relation") + "@" + q.Get("subject_id")
	}
)

// setup points keto at a fake that records every write and answers with status
func setup(t *testing.T, status int) (sqlmock.Sqlmock, *[]string) {
	mock := test.SetupMockDB()

	var calls []string
	keto := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls = append(calls, ketoCallsRecord(r))
		w.WriteHeader(status)
		_, _ = w.Write([]byte(`{}`))
	}))
	t.Cleanup(keto.Close)
	viper.Set("keto_write_api_url", keto.URL)

	return mock, &calls
}

func doRequest(method, path, body string) *httptest.ResponseRecorder {
	r := chi.NewRouter()
	r.Use(loggerx.Init())
	r.Mount("/admin/organisations/{organisation_id}/users", Router())
	req := httptest.NewRequest(method, path, strings.NewReader(body))
	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)
	return rec
}

func orgUserRow(role string) *sqlmock.Rows {
	return sqlmock.NewRows(orgUserCols).AddRow(9, time.Now(), time.Now(), nil, 0, 0, 3, 5, role)
}

func assertCalls(t *testing.T, got *[]string, want ...string) {
	t.Helper()
	if strings.Join(*got, ",") != strings.Join(want, ",") {
		t.Fatalf("keto calls = %v, want %v", *got, want)
	}
}

func TestUpdatePromotesMember(t *testing.T) {
	mock, calls := setup(t, http.StatusCreated)

	mock.ExpectBegin()
	mock.ExpectQuery(selectOrgUser).WithArgs(3, 5).WillReturnRows(orgUserRow("member"))
	mock.ExpectExec(updateRole).WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectCommit()

	rec := doRequest(http.MethodPut, "/admin/organisations/5/users/3", `{"role":"owner"}`)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200; body %s", rec.Code, rec.Body.String())
	}
	if !strings.Contains(rec.Body.String(), `"role":"owner"`) {
		t.Fatalf("body = %s, want role owner", rec.Body.String())
	}
	// new grant is written before the old one is revoked
	assertCalls(t, calls, "PUT org:5#owner@3", "DELETE org:5#member@3")
	test.ExpectationsMet(t, mock)
}

func TestUpdateRefusesToDemoteLastOwner(t *testing.T) {
	mock, calls := setup(t, http.StatusCreated)

	mock.ExpectBegin()
	mock.ExpectQuery(selectOrgUser).WithArgs(3, 5).WillReturnRows(orgUserRow("owner"))
	mock.ExpectQuery(selectOwnerIDs).WithArgs(5, "owner").WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(9))
	mock.ExpectRollback()

	rec := doRequest(http.MethodPut, "/admin/organisations/5/users/3", `{"role":"member"}`)

	if rec.Code != http.StatusUnprocessableEntity {
		t.Fatalf("status = %d, want 422; body %s", rec.Code, rec.Body.String())
	}
	assertCalls(t, calls)
	test.ExpectationsMet(t, mock)
}

func TestUpdateDemotesOwnerWhenAnotherOwnerExists(t *testing.T) {
	mock, calls := setup(t, http.StatusCreated)

	mock.ExpectBegin()
	mock.ExpectQuery(selectOrgUser).WithArgs(3, 5).WillReturnRows(orgUserRow("owner"))
	mock.ExpectQuery(selectOwnerIDs).WithArgs(5, "owner").WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(9).AddRow(10))
	mock.ExpectExec(updateRole).WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectCommit()

	rec := doRequest(http.MethodPut, "/admin/organisations/5/users/3", `{"role":"member"}`)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200; body %s", rec.Code, rec.Body.String())
	}
	assertCalls(t, calls, "PUT org:5#member@3", "DELETE org:5#owner@3")
	test.ExpectationsMet(t, mock)
}

func TestUpdateRollsBackWhenKetoFails(t *testing.T) {
	mock, calls := setup(t, http.StatusInternalServerError)

	mock.ExpectBegin()
	mock.ExpectQuery(selectOrgUser).WithArgs(3, 5).WillReturnRows(orgUserRow("member"))
	mock.ExpectExec(updateRole).WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectRollback()

	rec := doRequest(http.MethodPut, "/admin/organisations/5/users/3", `{"role":"owner"}`)

	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("status = %d, want 500; body %s", rec.Code, rec.Body.String())
	}
	assertCalls(t, calls, "PUT org:5#owner@3")
	test.ExpectationsMet(t, mock)
}

func TestUpdateRejectsUnknownRole(t *testing.T) {
	mock, calls := setup(t, http.StatusCreated)

	rec := doRequest(http.MethodPut, "/admin/organisations/5/users/3", `{"role":"admin"}`)

	if rec.Code != http.StatusUnprocessableEntity {
		t.Fatalf("status = %d, want 422; body %s", rec.Code, rec.Body.String())
	}
	assertCalls(t, calls)
	test.ExpectationsMet(t, mock)
}

func TestUpdateUnknownMember(t *testing.T) {
	mock, calls := setup(t, http.StatusCreated)

	mock.ExpectBegin()
	mock.ExpectQuery(selectOrgUser).WithArgs(3, 5).WillReturnRows(sqlmock.NewRows(orgUserCols))
	mock.ExpectRollback()

	rec := doRequest(http.MethodPut, "/admin/organisations/5/users/3", `{"role":"owner"}`)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want 404; body %s", rec.Code, rec.Body.String())
	}
	assertCalls(t, calls)
	test.ExpectationsMet(t, mock)
}

func TestCreateAddsUser(t *testing.T) {
	mock, calls := setup(t, http.StatusCreated)

	mock.ExpectQuery(selectOrg).WithArgs(5).WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(5))
	mock.ExpectQuery(selectUser).WithArgs("a@b.com").WillReturnRows(sqlmock.NewRows([]string{"id", "email"}).AddRow(3, "a@b.com"))
	mock.ExpectBegin()
	mock.ExpectQuery(countOrgUser).WithArgs(3, 5).WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(0))
	mock.ExpectQuery(insertOrgUser).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 0, 0, 3, 5, "member").
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
	mock.ExpectCommit()

	rec := doRequest(http.MethodPost, "/admin/organisations/5/users", `{"users":[{"email":"a@b.com","role":"member"}]}`)

	if rec.Code != http.StatusCreated {
		t.Fatalf("status = %d, want 201; body %s", rec.Code, rec.Body.String())
	}
	assertCalls(t, calls, "PUT org:5#member@3")
	test.ExpectationsMet(t, mock)
}

func TestCreateSkipsExistingMember(t *testing.T) {
	mock, calls := setup(t, http.StatusCreated)

	mock.ExpectQuery(selectOrg).WithArgs(5).WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(5))
	mock.ExpectQuery(selectUser).WithArgs("a@b.com").WillReturnRows(sqlmock.NewRows([]string{"id", "email"}).AddRow(3, "a@b.com"))
	mock.ExpectBegin()
	mock.ExpectQuery(countOrgUser).WithArgs(3, 5).WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))
	mock.ExpectRollback()

	rec := doRequest(http.MethodPost, "/admin/organisations/5/users", `{"users":[{"email":"a@b.com","role":"owner"}]}`)

	if rec.Code != http.StatusCreated || strings.TrimSpace(rec.Body.String()) != "[]" {
		t.Fatalf("status = %d body %s, want 201 []", rec.Code, rec.Body.String())
	}
	assertCalls(t, calls)
	test.ExpectationsMet(t, mock)
}

func TestCreateUnknownEmailWritesNothing(t *testing.T) {
	mock, calls := setup(t, http.StatusCreated)

	mock.ExpectQuery(selectOrg).WithArgs(5).WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(5))
	mock.ExpectQuery(selectUser).WithArgs("a@b.com").WillReturnRows(sqlmock.NewRows([]string{"id", "email"}).AddRow(3, "a@b.com"))
	mock.ExpectQuery(selectUser).WithArgs("x@b.com").WillReturnRows(sqlmock.NewRows([]string{"id", "email"}))

	rec := doRequest(http.MethodPost, "/admin/organisations/5/users", `{"users":[{"email":"a@b.com","role":"member"},{"email":"x@b.com","role":"member"}]}`)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want 404; body %s", rec.Code, rec.Body.String())
	}
	assertCalls(t, calls)
	test.ExpectationsMet(t, mock)
}

func TestCreateRejectsInvalidBody(t *testing.T) {
	for name, body := range map[string]string{
		"unknown role": `{"users":[{"email":"a@b.com","role":"admin"}]}`,
		"bad email":    `{"users":[{"email":"nope","role":"member"}]}`,
		"no users":     `{"users":[]}`,
	} {
		t.Run(name, func(t *testing.T) {
			mock, calls := setup(t, http.StatusCreated)

			rec := doRequest(http.MethodPost, "/admin/organisations/5/users", body)

			if rec.Code != http.StatusUnprocessableEntity {
				t.Fatalf("status = %d, want 422; body %s", rec.Code, rec.Body.String())
			}
			assertCalls(t, calls)
			test.ExpectationsMet(t, mock)
		})
	}
}

func TestDeleteRefusesLastOwner(t *testing.T) {
	mock, calls := setup(t, http.StatusCreated)

	mock.ExpectBegin()
	mock.ExpectQuery(selectOrgUser).WithArgs(3, 5).WillReturnRows(orgUserRow("owner"))
	mock.ExpectQuery(selectOwnerIDs).WithArgs(5, "owner").WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(9))
	mock.ExpectRollback()

	rec := doRequest(http.MethodDelete, "/admin/organisations/5/users/3", ``)

	if rec.Code != http.StatusUnprocessableEntity {
		t.Fatalf("status = %d, want 422; body %s", rec.Code, rec.Body.String())
	}
	assertCalls(t, calls)
	test.ExpectationsMet(t, mock)
}
