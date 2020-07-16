package user

import (
	"testing"
)

func TestRouter(t *testing.T) {
	userRouter := Router()
	got := userRouter.Routes()[0].Pattern
	expected := "/checker"

	if got != "/checker" {
		t.Errorf("handler returned wrong pattern: got %v want %v",
			got, expected)
	}
}
