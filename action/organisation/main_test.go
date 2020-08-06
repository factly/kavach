package organisation

import (
	"os"
	"testing"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/test"
)

func TestMain(m *testing.M) {
	os.Setenv("DSN", "postgres://postgres:postgres@localhost:5432/kavach-test?sslmode=disable")
	os.Setenv("KETO_API", "http://127.0.0.1:4466")
	model.SetupDB()

	exitValue := m.Run()

	test.CleanTables()

	os.Exit(exitValue)
}
