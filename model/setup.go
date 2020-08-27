package model

import (
	"fmt"
	"log"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
)

// DB connecter
var DB *gorm.DB

// SetupDB is database setuo
func SetupDB(DSN interface{}) {

	fmt.Println("connecting to database ...")
	var err error
	DB, err = gorm.Open("postgres", DSN)

	if err != nil {
		log.Fatal(err)
	}

	DB.LogMode(true)
}
