package token

import (
	"database/sql/driver"
	"regexp"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
)

var ApplicationToken = map[string]interface{}{
	"name":        "Test Token",
	"description": "Test Description",
}

var applicationTokenList = []map[string]interface{}{
	map[string]interface{}{
		"name":         "Test Token 1",
		"description":  "Test Description 1",
		"access_token": "Test Access Token 1",
		"hashed_token": "Test Hashed Token 1",
	},
	map[string]interface{}{
		"name":         "Test Token 2",
		"description":  "Test Description 2",
		"access_token": "Test Access Token 2",
		"hashed_token": "Test Hashed Token 2",
	},
}
var invalidApplicationToken = map[string]interface{}{
	"name":        "",
	"description": "",
}

var ValidateObject = map[string]interface{}{
	"access_token": "testaccesstoken",
	"secret_token": "testsecrettoken",
}

var invalidValidateObject = map[string]interface{}{
	"access_token": "",
	"secret_token": "",
}
var ApplicationTokenCols []string = []string{"id", "created_at", "updated_at", "deleted_at", "created_by_id", "updated_by_id", "name", "description", "application_id", "access_token", "hashed_token"}

var selectQuery string = regexp.QuoteMeta(`SELECT * FROM "application_tokens"`)

const basePath string = "/organisations/{organisation_id}/applications/{application_id}/tokens"
const path string = "/organisations/{organisation_id}/applications/{application_id}/tokens/{token_id}"
const validatePath string = "/applications/{application_slug}/validateToken"

func ApplicationTokenSelect(mock sqlmock.Sqlmock, args ...driver.Value) {
	mock.ExpectQuery(selectQuery).
		WithArgs(args...).
		WillReturnRows(sqlmock.NewRows(ApplicationTokenCols).
			AddRow(1, time.Now(), time.Now(), nil, 1, 1, ApplicationToken["name"], ApplicationToken["description"], 1, "access_token", "hashed_token"))
}
