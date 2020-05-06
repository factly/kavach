package util

import (
	"regexp"
	"strings"
)

// CreateSlug return slug
func CreateSlug(s string) string {
	var re = regexp.MustCompile("[^a-z0-9]+")
	return strings.Trim(re.ReplaceAllString(strings.ToLower(s), "-"), "-")
}
