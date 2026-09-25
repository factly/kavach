package invite

import (
	"net/http"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/util/test"
)

var softDeleteInvitation = regexp.QuoteMeta(`UPDATE "invitations" SET "deleted_at"=$1 WHERE (id = $2 AND invitee_id = $3)`)

func TestDeleteRejectsInvitationNotOwnedByCaller(t *testing.T) {
	mock := test.SetupMockDB()

	mock.ExpectBegin()
	mock.ExpectExec(softDeleteInvitation).
		WithArgs(test.AnyTime{}, 7, 73500).
		WillReturnResult(sqlmock.NewResult(0, 0))
	mock.ExpectCommit()

	rec := doRequest(http.MethodDelete, "7", "73500", ``)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want 404; body %s", rec.Code, rec.Body.String())
	}
	test.ExpectationsMet(t, mock)
}

func TestDeleteOwnInvitation(t *testing.T) {
	mock := test.SetupMockDB()

	mock.ExpectBegin()
	mock.ExpectExec(softDeleteInvitation).
		WithArgs(test.AnyTime{}, 7, 73500).
		WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectCommit()

	rec := doRequest(http.MethodDelete, "7", "73500", ``)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200; body %s", rec.Code, rec.Body.String())
	}
	test.ExpectationsMet(t, mock)
}
