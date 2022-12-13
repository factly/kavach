package util

import (
	"github.com/factly/x/loggerx"
	"golang.org/x/crypto/bcrypt"
)

// GenerateSecretToken generates secret token for application
func GenerateSecretToken(str string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(str), bcrypt.DefaultCost)
	if err != nil {
		loggerx.Error(err)
		return "", err
	}
	return string(hash), nil
}
