package profile

import (
	"regexp"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
)

var User map[string]interface{} = map[string]interface{}{
	"email":              "test@mail.com",
	"kid":                "testkid",
	"first_name":         "TEst Fname",
	"last_name":          "Test LName",
	"birth_date":         "Test BD",
	"gender":             "testgender",
	"featured_medium_id": 1,
}

var undecodableUser map[string]interface{} = map[string]interface{}{
	"email":      1,
	"kid":        1,
	"birth_date": time.Now(),
	"gender":     5,
}

var UserCols []string = []string{"id", "created_at", "updated_at", "deleted_at", "email", "kid", "first_name", "last_name", "birth_date", "gender", "featured_medium_id"}

const path string = "/profile"

func UserSelectMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "users"`)).
		WillReturnRows(sqlmock.NewRows(UserCols).
			AddRow(1, time.Now(), time.Now(), nil, User["email"], User["kid"], User["first_name"], User["last_name"], User["birth_date"], User["gender"], User["featured_medium_id"]))
}
