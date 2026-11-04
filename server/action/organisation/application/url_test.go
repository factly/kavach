package application

import (
	"testing"

	"github.com/spf13/viper"
)

func TestValidAppURL(t *testing.T) {
	cases := map[string]bool{
		"https://app.factly.in":             true,
		"https://app.factly.in/path?q=1":    true,
		"http://app.factly.in":              false,
		"javascript:alert(document.domain)": false,
		"JavaScript://%0aalert(1)":          false,
		"data:text/html,<script>":           false,
		"//evil.example":                    false,
		"app.factly.in":                     false,
		"https://user:pass@evil.example":    false,
		"https:///nohost":                   false,
		"":                                  false,
	}
	for raw, want := range cases {
		if got := validAppURL(raw); got != want {
			t.Errorf("validAppURL(%q) = %v, want %v", raw, got, want)
		}
	}

	viper.Set("mode", "development")
	defer viper.Set("mode", "")
	if !validAppURL("http://localhost:3000") {
		t.Error("http should be accepted in development mode")
	}
}
