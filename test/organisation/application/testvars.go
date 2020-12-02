package application

import (
	"database/sql/driver"
	"regexp"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
)

var Application = map[string]interface{}{
	"name":            "Test Application",
	"description":     "Test Desc",
	"url":             "testapp.com",
	"medium_id":       1,
	"organisation_id": 1,
}

var applicationList = []map[string]interface{}{
	map[string]interface{}{
		"name":            "Test Application 1",
		"description":     "Test Desc 1",
		"url":             "testapp1.com",
		"medium_id":       1,
		"organisation_id": 1,
	},
	map[string]interface{}{
		"name":            "Test Application 2",
		"description":     "Test Desc 2",
		"url":             "testapp2.com",
		"medium_id":       1,
		"organisation_id": 1,
	},
}

var invalidApplication = map[string]interface{}{
	"name":        "Test Application",
	"description": "Test Desc",
	"medium_id":   1,
}

var ApplicationCols []string = []string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "name", "description", "url", "medium_id", "organisation_id"}

var mediumCols = []string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "name", "slug", "type", "title", "description", "caption", "alt_text", "file_size", "url", "dimensions", "user_id"}

var selectQuery string = regexp.QuoteMeta(`SELECT * FROM "applications"`)

const basePath string = "/organisations/{organisation_id}/applications"
const path string = "/organisations/{organisation_id}/applications/{application_id}"

func ApplicationSelectMock(mock sqlmock.Sqlmock, args ...driver.Value) {
	mock.ExpectQuery(selectQuery).
		WithArgs(args...).
		WillReturnRows(sqlmock.NewRows(ApplicationCols).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, Application["name"], Application["description"], Application["url"], Application["medium_id"], Application["organisation_id"]))
}
