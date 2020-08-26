package model

import (
	"fmt"
	"log"

	"github.com/factly/kavach-server/config"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
)

// DB connecter
var DB *gorm.DB

// SetupDB is database setuo
func SetupDB() {

	fmt.Println("connecting to database ...")
	var err error
	DB, err = gorm.Open("postgres", config.DSN)

	if err != nil {
		log.Fatal(err)
	}

	DB.LogMode(true)

	DB.AutoMigrate(
		&Organisation{},
		&User{},
		&OrganisationUser{},
	)

	// Adding foreignKey
	DB.Model(&OrganisationUser{}).AddForeignKey("user_id", "users(id)", "RESTRICT", "RESTRICT")
	DB.Model(&OrganisationUser{}).AddForeignKey("organisation_id", "organisations(id)", "RESTRICT", "RESTRICT")
}
