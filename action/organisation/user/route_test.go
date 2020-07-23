package user

import (
	"testing"
)

func TestOrganisationUserRouter(t *testing.T) {
	organisationUserRouter := Router()
	got := len(organisationUserRouter.Routes()[0].Handlers)
	expected := 2

	if got != expected {
		t.Errorf("handler returned wrong pattern: got %v want %v",
			got, expected)
	}
}
