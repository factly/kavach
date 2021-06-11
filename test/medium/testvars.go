package medium

import (
	"database/sql/driver"
	"regexp"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/jinzhu/gorm/dialects/postgres"
)

var Data = map[string]interface{}{
	"name":        "Image",
	"slug":        "image",
	"type":        "jpg",
	"title":       "Sample image",
	"description": "desc",
	"caption":     "sample",
	"alt_text":    "sample",
	"file_size":   100,
	"url": postgres.Jsonb{
		RawMessage: []byte(`{"raw":"http://testimage.com/test.jpg"}`),
	},
	"dimensions": "testdims",
}

var mediumList = []map[string]interface{}{
	{
		"name":        "Image 1",
		"slug":        "image 1",
		"type":        "jpg",
		"title":       "Sample image 1",
		"description": "desc 1",
		"caption":     "sample 1",
		"alt_text":    "sample1 ",
		"file_size":   100,
		"url": postgres.Jsonb{
			RawMessage: []byte(`{"raw":"http://testimage.com/test1.jpg"}`),
		},
		"dimensions": "testdims",
	},
	{
		"name":        "Image 2",
		"slug":        "image 2",
		"type":        "jpg",
		"title":       "Sample image 2",
		"description": "desc 2",
		"caption":     "sample 2",
		"alt_text":    "sample2 ",
		"file_size":   200,
		"url": postgres.Jsonb{
			RawMessage: []byte(`{"raw":"http://testimage.com/test2.jpg"}`),
		},
		"dimensions": "testdims",
	},
}

var invalidData = []map[string]interface{}{
	{
		"name": "a",
	},
}

var columns = []string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "name", "slug", "type", "title", "description", "caption", "alt_text", "file_size", "url", "dimensions", "user_id"}

var selectQuery = regexp.QuoteMeta(`SELECT * FROM "media"`)

var basePath = "/media"
var path = "/media/{medium_id}"

func SelectQuery(mock sqlmock.Sqlmock, args ...driver.Value) {
	mock.ExpectQuery(selectQuery).
		WithArgs(args...).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, Data["name"], Data["slug"], Data["type"], Data["title"], Data["description"], Data["caption"], Data["alt_text"], Data["file_size"], Data["url"], Data["dimensions"], 1))
}

func countQuery(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(1) FROM "media"`)).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

func userMediumCount(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(1) FROM "users"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

func organisationMediumCount(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(1) FROM "organisations"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

func applicationMediumCount(mock sqlmock.Sqlmock, count int) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(1) FROM "applications"`)).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}
