package user

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/kavach-server/model"
	"github.com/go-chi/chi"
)

func TestUserList(t *testing.T) {
	model.SetupDB()

	r := chi.NewRouter()
	r.Post("/users/list", list)

	req, err := http.NewRequest("POST", "/users/list", nil)
	if err != nil {
		t.Fatal(err)
	}
	rr := httptest.NewRecorder()

	r.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

}
