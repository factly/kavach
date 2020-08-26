package organisation

import (
	"regexp"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
)

var Organisation map[string]interface{} = map[string]interface{}{
	"title": "Test Organisation",
}

var invalidOrganisation map[string]interface{} = map[string]interface{}{
	"tit": "Test Organisation",
}

var OrganisationCols []string = []string{"id", "created_at", "updated_at", "deleted_at", "title"}

var selectQuery string = regexp.QuoteMeta(`SELECT * FROM "organisations"`)
var countQuery string = regexp.QuoteMeta(`SELECT count(*) FROM "organisations"`)

const basePath string = "/organisations"
const path string = "/organisations/{organisation_id}"

func OrganisationSelectMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "organisations"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows(OrganisationCols).
			AddRow(1, time.Now(), time.Now(), nil, Organisation["title"]))

}
