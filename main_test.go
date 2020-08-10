package main

import (
	"os"
	"testing"

	"github.com/factly/kavach-server/model"
)

func TestMain(m *testing.M) {
	os.Setenv("DSN", "postgres://postgres:postgres@localhost:5432/kavach-test?sslmode=disable")
	model.SetupDB()
	exitVal := m.Run()
	os.Exit(exitVal)
}
