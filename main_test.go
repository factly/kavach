package main

import (
	"os"
	"testing"

	"github.com/factly/kavach-server/model"
	"github.com/joho/godotenv"
)

func TestMain(m *testing.M) {
	model.SetupDB()
	godotenv.Load()
	os.Exit(m.Run())
}
