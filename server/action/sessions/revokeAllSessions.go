package sessions

import (
	"net/http"

	"github.com/factly/kavach-server/util/kratos"
	"github.com/factly/x/errorx"
	"github.com/factly/x/renderx"
)

func revokeAllSessions(w http.ResponseWriter, r *http.Request) {
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

	err = kratos.RevokeAllSessions(orySessionCookie.Value)
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.GetMessage("error in revoking all the sesions", http.StatusInternalServerError)))
		return
	}

	renderx.JSON(w, http.StatusOK, map[string]interface{}{
		"message": "sessions revoked successfully",
	})
}
