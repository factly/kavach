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
	var err error
	DB, err = gorm.Open("postgres", DSN)

	if err != nil {
		log.Fatal(err)
	}

	DB.LogMode(true)

	DB.AutoMigrate(
		&Organization{},
		&User{},
		&OrganizationUser{},
	)

	// Adding foreignKey
	DB.Model(&OrganizationUser{}).AddForeignKey("user_id", "users(id)", "RESTRICT", "RESTRICT")
	DB.Model(&OrganizationUser{}).AddForeignKey("organization_id", "organizations(id)", "RESTRICT", "RESTRICT")
}
