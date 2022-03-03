package main

import (
	"github.com/factly/kavach-server/cmd"
	_ "github.com/factly/kavach-server/docs"
)

// @title Kavach Server API
// @version 1.0
// @description Kavach Server API

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:5001
// @BasePath /
func main() {
	cmd.Execute()
}
