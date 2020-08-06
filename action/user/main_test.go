package user

import (
	"os"
	"testing"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/test"
)

func TestMain(m *testing.M) {
	os.Setenv("DSN", "postgres://postgres:postgres@localhost:5432/kavach-test?sslmode=disable")
	model.SetupDB()

	exitValue := m.Run()

	test.CleanTables()
	os.Exit(exitValue)
}
