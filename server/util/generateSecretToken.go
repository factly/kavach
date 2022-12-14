package util

import "crypto/rand"

var MAX_LENGTH int = 60

var charSet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"

func GenerateSecretToken() string {
	ll := len(charSet)
	b := make([]byte, MAX_LENGTH)
	rand.Read(b) // generates len(b) random bytes
	for i := 0; i < MAX_LENGTH; i++ {
		b[i] = charSet[int(b[i])%ll]
	}
	return string(b)
}
