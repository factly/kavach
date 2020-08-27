package user

import (
	"regexp"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
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
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows(OrganisationUserCols).
			AddRow(1, time.Now(), time.Now(), nil, OrganisationUser["user_id"], OrganisationUser["organisation_id"], OrganisationUser["role"]))
}
