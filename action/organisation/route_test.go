package organisation

import (
	"testing"
)

func TestOrganisationRouter(t *testing.T) {
	organisationRouter := Router()
	got := len(organisationRouter.Routes()[0].Handlers)
	expected := 10

	if got != expected {
		t.Errorf("handler returned wrong pattern: got %v want %v",
			got, expected)
	}
}
