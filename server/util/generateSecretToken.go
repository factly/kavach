package util

import (
	"log"
	"golang.org/x/crypto/bcrypt"
)

// GenerateSecretToken generates secret token for application
func GenerateSecretToken(str string) string {
	hash, err := bcrypt.GenerateFromPassword([]byte(str), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal(err)
	}
	return string(hash)
}
