package profile

import (
	"testing"
)

func TestProfileRouter(t *testing.T) {
	profileRouter := Router()
	got := len(profileRouter.Routes()[0].Handlers)
	expected := 2

	if got != expected {
		t.Errorf("handler returned wrong pattern: got %v want %v",
			got, expected)
	}
}
