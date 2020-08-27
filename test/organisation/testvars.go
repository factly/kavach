package organisation

import (
	"regexp"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/test/organisation/user"
	"github.com/factly/kavach-server/util/test"
)

var Organisation map[string]interface{} = map[string]interface{}{
	"title": "Test Organisation",
}

var invalidOrganisation map[string]interface{} = map[string]interface{}{
	"title": 20,
}

var orgWithoutTitle map[string]interface{} = map[string]interface{}{
	"tit": "Test",
}

var OrganisationCols []string = []string{"id", "created_at", "updated_at", "deleted_at", "title"}

var selectQuery string = regexp.QuoteMeta(`SELECT * FROM "organisations"`)

const basePath string = "/organisations"
const path string = "/organisations/{organisation_id}"

func OrganisationSelectMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows(OrganisationCols).
			AddRow(1, time.Now(), time.Now(), nil, Organisation["title"]))

}

func insertMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(`INSERT INTO "organisations"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Organisation["title"]).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))

	mock.ExpectQuery(`INSERT INTO "organisation_users"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, user.OrganisationUser["user_id"], user.OrganisationUser["organisation_id"], user.OrganisationUser["role"]).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
}
