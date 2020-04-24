package actions

import (
	"regexp"
	"strings"
)

func SlugCreater(s string) string {
	var re = regexp.MustCompile("[^a-z0-9]+")
	return strings.Trim(re.ReplaceAllString(strings.ToLower(s), "-"), "-")
}
