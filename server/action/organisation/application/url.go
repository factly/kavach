package application

import (
	"net/url"

	"github.com/spf13/viper"
)

// validAppURL reports whether raw is an absolute https URL (http is also
// accepted in development mode). The web app navigates to this value, so a
// javascript: or data: URL here is stored XSS on the login origin; the
// go-playground `url` tag accepts those schemes and cannot be used instead.
func validAppURL(raw string) bool {
	u, err := url.Parse(raw)
	if err != nil || u.Host == "" || u.User != nil {
		return false
	}
	switch u.Scheme {
	case "https":
		return true
	case "http":
		return viper.GetString("mode") == "development"
	}
	return false
}
