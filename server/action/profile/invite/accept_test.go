package invite

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

var invitationCols = []string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "invitee_id", "organisation_id", "role", "status", "expired_at"}

func setupAccept(t *testing.T) (sqlmock.Sqlmock, *[]map[string]interface{}) {
	mock := test.SetupMockDB()

	var tuples []map[string]interface{}
	keto := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tuple := map[string]interface{}{}
		_ = json.NewDecoder(r.Body).Decode(&tuple)
		tuples = append(tuples, tuple)
		w.WriteHeader(http.StatusCreated)
	}))
	t.Cleanup(keto.Close)
	viper.Set("keto_write_api_url", keto.URL)

	return mock, &tuples
}

func doRequest(method, inviteID, userID, body string) *httptest.ResponseRecorder {
	r := chi.NewRouter()
	r.Use(loggerx.Init())
	r.Mount("/profile/invite", Router())
	req := httptest.NewRequest(method, "/profile/invite/"+inviteID, strings.NewReader(body))
	req.Header.Set("X-User", userID)
	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)
	return rec
}

var selectInvitation = regexp.QuoteMeta(`SELECT * FROM "invitations" WHERE (id = $1 AND invitee_id = $2 AND status = $3 AND expired_at > $4)`)

func TestAcceptRejectsInvitationNotOwnedByCaller(t *testing.T) {
	mock, tuples := setupAccept(t)

	mock.ExpectBegin()
	mock.ExpectQuery(selectInvitation).
		WithArgs(7, 73500, false, test.AnyTime{}).
		WillReturnRows(sqlmock.NewRows(invitationCols))
	mock.ExpectRollback()

	rec := doRequest(http.MethodPut, "7", "73500", `{"organisation_id":40778,"role":"owner"}`)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want 404; body %s", rec.Code, rec.Body.String())
	}
	if len(*tuples) != 0 {
		t.Fatalf("keto tuples written: %v", *tuples)
	}
	test.ExpectationsMet(t, mock)
}

func TestAcceptUsesInvitationNotRequestBody(t *testing.T) {
	mock, tuples := setupAccept(t)

	mock.ExpectBegin()
	mock.ExpectQuery(selectInvitation).
		WithArgs(7, 73500, false, test.AnyTime{}).
		WillReturnRows(sqlmock.NewRows(invitationCols).
			AddRow(7, time.Now(), time.Now(), nil, 1, 0, 73500, 5, "member", false, time.Now().Add(time.Hour)))
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "organisation_users"`)).
		WithArgs(5, 73500).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(0))
	mock.ExpectExec(regexp.QuoteMeta(`UPDATE "invitations" SET "status"=$1`)).
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectQuery(regexp.QuoteMeta(`INSERT INTO "organisation_users"`)).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, 0, 0, 73500, 5, "member").
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
	mock.ExpectCommit()

	rec := doRequest(http.MethodPut, "7", "73500", `{"organisation_id":40778,"role":"owner"}`)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200; body %s", rec.Code, rec.Body.String())
	}
	if len(*tuples) != 1 || (*tuples)[0]["object"] != "org:5" || (*tuples)[0]["relation"] != "member" || (*tuples)[0]["subject_id"] != "73500" {
		t.Fatalf("keto tuples = %v, want one org:5#member@73500", *tuples)
	}
	test.ExpectationsMet(t, mock)
}

func TestAcceptStopsWhenAlreadyMember(t *testing.T) {
	mock, tuples := setupAccept(t)

	mock.ExpectBegin()
	mock.ExpectQuery(selectInvitation).
		WillReturnRows(sqlmock.NewRows(invitationCols).
			AddRow(7, time.Now(), time.Now(), nil, 1, 0, 73500, 5, "owner", false, time.Now().Add(time.Hour)))
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(*) FROM "organisation_users"`)).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))
	mock.ExpectRollback()

	rec := doRequest(http.MethodPut, "7", "73500", ``)

	if rec.Code == http.StatusOK {
		t.Fatalf("status = 200, want an error")
	}
	if len(*tuples) != 0 {
		t.Fatalf("keto tuples written: %v", *tuples)
	}
	test.ExpectationsMet(t, mock)
}
