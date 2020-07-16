package model

import (
	"fmt"
	"log"
	"os"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
)

// DB connecter
var DB *gorm.DB

// SetupDB is database setuo
func SetupDB() {

	fmt.Println("connecting to database ...")

	DSN := os.Getenv("DSN")
	if DSN == "" {
		DSN = "postgres://postgres:postgres@localhost:5432/kavach?sslmode=disable"
	}
	var err error
	DB, err = gorm.Open("postgres", DSN)

	if err != nil {
		log.Fatal(err)
	}

	//DB.LogMode(true)

	DB.AutoMigrate(
		&Organisation{},
		&User{},
		&OrganisationUser{},
	)

	// Adding foreignKey
	DB.Model(&OrganisationUser{}).AddForeignKey("user_id", "users(id)", "RESTRICT", "RESTRICT")
	DB.Model(&OrganisationUser{}).AddForeignKey("organisation_id", "organisations(id)", "RESTRICT", "RESTRICT")
}
