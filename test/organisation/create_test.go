package organisation

import (
	"log"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/util/test"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestCreateOrganisation(t *testing.T) {

	// Setup DB
	mock := test.SetupMockDB()

	defer gock.Disable()
	err := test.MockServer()
	if err != nil {
		log.Fatal(err)
	}
	defer gock.DisableNetworking()

	// Setup HttpExpect
	router := action.RegisterRoutes()
	server := httptest.NewServer(router)
	defer server.Close()

	gock.New(server.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()

	e := httpexpect.New(t, server.URL)

	t.Run("create organisation", func(t *testing.T) {
		mock.ExpectBegin()
		insertMock(mock)
		mock.ExpectCommit()

		e.POST(basePath).
			WithHeader("X-User", "1").
			WithJSON(Organisation).
			Expect().
			Status(http.StatusCreated).
			JSON().
			Object().
			ContainsMap(Organisation)

		test.ExpectationsMet(t, mock)
	})

	t.Run("undecodable organisation body", func(t *testing.T) {
		e.POST(basePath).
			WithHeader("X-User", "1").
			WithJSON(invalidOrganisation).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("organisation title required", func(t *testing.T) {
		e.POST(basePath).
			WithHeader("X-User", "1").
			WithJSON(orgWithoutTitle).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("when keto is down", func(t *testing.T) {
		gock.Off()
		mock.ExpectBegin()
		insertMock(mock)
		mock.ExpectRollback()

		e.POST(basePath).
			WithHeader("X-User", "1").
			WithJSON(Organisation).
			Expect().
			Status(http.StatusServiceUnavailable)

		test.ExpectationsMet(t, mock)
	})
}
