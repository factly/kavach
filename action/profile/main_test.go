package profile

import (
	"os"
	"testing"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util"
	"github.com/factly/kavach-server/util/test"
)

func TestMain(m *testing.M) {
	os.Setenv("DSN", "postgres://postgres:postgres@localhost:5432/kavach-test?sslmode=disable")
	model.SetupDB()

	file, _ := os.OpenFile("logrus.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)

	util.InitLogging(file)

	exitValue := m.Run()

	test.CleanTables()

	os.Exit(exitValue)
}
