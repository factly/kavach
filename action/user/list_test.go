package user

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/test"
	"github.com/go-chi/chi"
)

func TestUserList(t *testing.T) {
	model.SetupDB()

	r := chi.NewRouter()
	r.Post("/users/list", list)

	ts := httptest.NewServer(r)
	defer ts.Close()

	t.Run("get users list", func(t *testing.T) {
		_, _, statusCode := test.Request(t, ts, "POST", "/users/list", nil, "1")

		if statusCode != http.StatusOK {
			t.Errorf("handler returned wrong status code: got %v want %v", statusCode, http.StatusOK)
		}

	})

}
