package admin

import (
	"log"
	"net/http"

	"github.com/factly/kavach-server/action/admin/organisation"
	"github.com/factly/kavach-server/action/admin/user"
	"github.com/go-chi/chi"
	"github.com/spf13/viper"
)

// Router organisation
func AdminRouter() chi.Router {
	r := chi.NewRouter()

	r.With(CheckMasterKey).Route("/", func(r chi.Router) {
		r.Mount("/users", user.Router())
		r.Mount("/organisations", organisation.Router())
	})

	return r
}

// CheckMasterKey check X-User in header
func CheckMasterKey(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestMasterKey := r.Header.Get("X-KAVACH-MASTER-KEY")

		log.Println(requestMasterKey)
		log.Println(viper.GetString("master_key"))
		if requestMasterKey != viper.GetString("master_key") {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		h.ServeHTTP(w, r)
	})
}
