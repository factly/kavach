package invite

import (
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

func delete(w http.ResponseWriter, r *http.Request) {
	invitationID := chi.URLParam(r, "invite_id")
	invID, err := strconv.Atoi(invitationID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	tx := model.DB.Begin()
	invites := model.Invitation{
		Base: model.Base{
			ID: uint(invID),
		},
	}

	tx.Where(&invites).Delete(&invites)
	tx.Commit()
	renderx.JSON(w, http.StatusOK, nil)
}
