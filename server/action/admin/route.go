package admin

import (
	"errors"
	"net/http"

	application "github.com/factly/kavach-server/action/admin/appication"
	"github.com/factly/kavach-server/action/admin/organisation"
	"github.com/factly/kavach-server/action/admin/user"
	"github.com/factly/x/loggerx"
	"github.com/go-chi/chi"
	"github.com/spf13/viper"
)

// Router organisation
func AdminRouter() chi.Router {
	r := chi.NewRouter()

	r.With(CheckMasterKey).Route("/", func(r chi.Router) {
		r.Mount("/users", user.Router())
		r.Mount("/organisations", organisation.Router())
		r.Post("/application/add_user", application.AddUser)
	})

	return r
}

// CheckMasterKey check X-User in header
func CheckMasterKey(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestMasterKey := r.Header.Get("X-KAVACH-MASTER-KEY")
		masterKey := viper.GetString("master_key")

		if requestMasterKey != masterKey {
			if masterKey == "" {
				loggerx.Error(errors.New("master key is not set"))
			} else {
				loggerx.Error(errors.New("invalid master key"))
			}
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		h.ServeHTTP(w, r)
	})
}
