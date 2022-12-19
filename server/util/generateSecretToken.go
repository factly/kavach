package util

import (
	"crypto/rand"

	"github.com/factly/x/loggerx"
)

var MAX_LENGTH int = 60

var charSet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"

func GenerateSecretToken() (string, error) {
	token := make([]byte, MAX_LENGTH)
	_, err := rand.Read(token) // generates random bytes of length MAX_LENGTH
	if err != nil {
		loggerx.Error(err)
		return "", nil
	}
	for i := 0; i < MAX_LENGTH; i++ {
		token[i] = charSet[int(token[i])%len(charSet)]
	}
	return string(token), nil
}
