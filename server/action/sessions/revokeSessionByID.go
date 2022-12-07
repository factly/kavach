package sessions

import (
	"net/http"

	"github.com/factly/kavach-server/util/kratos"
	"github.com/factly/x/errorx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

func revokeSessionByID(w http.ResponseWriter, r *http.Request) {
	sessionID := chi.URLParam(r, "session_id")
	if sessionID == "" {
		errorx.Render(w, errorx.Parser(errorx.GetMessage("invalid session id", http.StatusBadRequest)))
		return
	}

	userID := r.Header.Get("X-User")
	if userID == "" {
		errorx.Render(w, errorx.Parser(errorx.GetMessage("X-User header not provided", http.StatusBadRequest)))
		return
	}

	orySessionCookie, err := r.Cookie("ory_kratos_session")
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.GetMessage("ory_kratos_session not found", http.StatusInternalServerError)))
		return
	}
	err = kratos.RevokeSessionByID(sessionID, orySessionCookie.Value)
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.GetMessage("error in revoking session", http.StatusInternalServerError)))
		return
	}

	renderx.JSON(w, http.StatusOK, map[string]interface{}{
		"message": "sessions revoked successfully",
	})
}
