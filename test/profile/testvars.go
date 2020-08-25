package profile

import (
	"regexp"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
)

var User map[string]interface{} = map[string]interface{}{
	"email":      "test@mail.com",
	"kid":        "testkid",
	"first_name": "TEst Fname",
	"last_name":  "Test LName",
	"birth_date": "Test BD",
	"gender":     "testgender",
}

var UserCols []string = []string{"id", "created_at", "updated_at", "deleted_at", "email", "kid", "first_name", "last_name", "birth_date", "gender"}

func UserSelectMock(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "users"`)).
		WillReturnRows(sqlmock.NewRows(UserCols).
			AddRow(1, time.Now(), time.Now(), nil, User["email"], User["kid"], User["first_name"], User["last_name"], User["birth_date"], User["gender"]))
}
