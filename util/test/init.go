package test

import (
	"github.com/factly/kavach-server/model"
)

// Init - Initialize db & load env
func Init() {
	model.SetupDB()

}
