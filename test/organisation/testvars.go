package organisation

import (
	"database/sql/driver"
	"regexp"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/test/organisation/user"
	"github.com/factly/kavach-server/util/test"
)

var Organisation map[string]interface{} = map[string]interface{}{
	"title":       "Test Organisation",
	"slug":        "test-organisation",
	"description": "Test Organisation",
}

var invalidOrganisation map[string]interface{} = map[string]interface{}{
	"title": 20,
}

var orgWithoutTitle map[string]interface{} = map[string]interface{}{
	"tit": "Test",
}

var OrganisationCols []string = []string{"id", "created_at", "updated_at", "deleted_at", "title", "slug", "description"}

var selectQuery string = regexp.QuoteMeta(`SELECT * FROM "organisations"`)

const basePath string = "/organisations"
const path string = "/organisations/{organisation_id}"

func OrganisationSelectMock(mock sqlmock.Sqlmock, args ...driver.Value) {
	mock.ExpectQuery(selectQuery).
		WithArgs(args...).
		WillReturnRows(sqlmock.NewRows(OrganisationCols).
			AddRow(1, time.Now(), time.Now(), nil, Organisation["title"], Organisation["slug"], Organisation["description"]))

}

func insertMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(`INSERT INTO "organisations"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Organisation["title"], Organisation["slug"], Organisation["description"]).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))

	mock.ExpectQuery(`INSERT INTO "organisation_users"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, user.OrganisationUser["user_id"], user.OrganisationUser["organisation_id"], user.OrganisationUser["role"]).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
}
