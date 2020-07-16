package user

import (
	"testing"
)

func TestRouter(t *testing.T) {
	a := Router()
	got := a.Routes()[0].Pattern
	expected := "/checker"

	if got != "/checker" {
		t.Errorf("handler returned wrong pattern: got %v want %v",
			got, expected)
	}
}
