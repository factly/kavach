package model

import (
	"fmt"
	"log"
	"os"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	"github.com/joho/godotenv"
)

// DB connecter
var DB *gorm.DB

// SetupDB is database setuo
func SetupDB() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("error loding .env file")
	}
	fmt.Println("connecting to database ...")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbHost := os.Getenv("DB_HOST")

	connStr := fmt.Sprintf("host=%s user=%s dbname=%s sslmode=disable password=%s", dbHost, dbUser, dbName, dbPassword) //Build connection string

	DB, err = gorm.Open("postgres", connStr)

	if err != nil {
		log.Fatal(err)
	}

	DB.AutoMigrate(
		&Organization{},
		&Service{},
		&User{},
		&OrganizationUser{},
	)

	// Adding foreignKey
	DB.Model(&OrganizationUser{}).AddForeignKey("user_id", "users(id)", "RESTRICT", "RESTRICT")
	DB.Model(&OrganizationUser{}).AddForeignKey("organization_id", "organizations(id)", "RESTRICT", "RESTRICT")
}
