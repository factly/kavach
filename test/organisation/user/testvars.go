package user

import (
	"regexp"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/test/profile"
	"github.com/factly/kavach-server/util/test"
)

var OrganisationUser map[string]interface{} = map[string]interface{}{
	"user_id":         1,
	"organisation_id": 1,
	"role":            "owner",
}

var organisationuserlist []map[string]interface{} = []map[string]interface{}{
	{
		"user_id":         1,
		"organisation_id": 1,
		"role":            "owner",
	},
	{
		"user_id":         1,
		"organisation_id": 1,
		"role":            "member",
	},
}

var Invite map[string]interface{} = map[string]interface{}{
	"email": "test@email.com",
	"role":  "owner",
}

var undecodableInvite map[string]interface{} = map[string]interface{}{
	"email": 1,
	"role":  10,
}

var invalidInvite map[string]interface{} = map[string]interface{}{
	"emal": "test@email.com",
	"rol":  "owner",
}

var OrganisationUserCols []string = []string{"id", "created_at", "updated_at", "deleted_at", "user_id", "organisation_id", "role"}

var selectQuery string = regexp.QuoteMeta(`SELECT * FROM "organisation_users"`)
var countQuery string = regexp.QuoteMeta(`SELECT count(*) FROM "organisation_users"`)

const basePath string = "/organisations/{organisation_id}/users"
const path string = "/organisations/{organisation_id}/users/{user_id}"

func OrganisationUserSelectMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows(OrganisationUserCols).
			AddRow(1, time.Now(), time.Now(), nil, OrganisationUser["user_id"], OrganisationUser["organisation_id"], OrganisationUser["role"]))
}

func OrganisationUserOwnerSelectMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1, 1, "owner").
		WillReturnRows(sqlmock.NewRows(OrganisationUserCols).
			AddRow(1, time.Now(), time.Now(), nil, OrganisationUser["user_id"], OrganisationUser["organisation_id"], OrganisationUser["role"]))
}

func orgUserDeleteSelectMock(mock sqlmock.Sqlmock, role string, ownCnt int) {
	mock.ExpectQuery(selectQuery).
		WithArgs(2, 1, "owner").
		WillReturnRows(sqlmock.NewRows(OrganisationUserCols).
			AddRow(1, time.Now(), time.Now(), nil, OrganisationUser["user_id"], OrganisationUser["organisation_id"], OrganisationUser["role"]))

	mock.ExpectQuery(selectQuery).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows(OrganisationUserCols).
			AddRow(1, time.Now(), time.Now(), nil, OrganisationUser["user_id"], OrganisationUser["organisation_id"], role))

	mock.ExpectQuery(countQuery).
		WithArgs(1, "owner").
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(ownCnt))
}

func deleteMock(mock sqlmock.Sqlmock) {
	mock.ExpectExec(regexp.QuoteMeta(`UPDATE "organisation_users" SET "deleted_at"=`)).
		WithArgs(test.AnyTime{}, 1).
		WillReturnResult(sqlmock.NewResult(1, 1))
}

func selectOrInsertMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "users"`)).
		WillReturnRows(sqlmock.NewRows(profile.UserCols))

	mock.ExpectQuery(`INSERT INTO "users"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Invite["email"], "", "", "", "", "").
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
}
