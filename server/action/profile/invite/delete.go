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

// delete - Delete organisation invite
// @Summary Delete organisation invite
// @Description Deleting organisation invite
// @Tags Invite
// @Produce json
// @Param X-User header string true "User ID"
// @Param invite_id path string true "Invitation ID"
// @Failure 400 {array} string
// @Router /profile/invite/{invite_id} [delete]
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

	err = tx.Where(&invites).Update("status", model.Rejected).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	tx.Commit()
	renderx.JSON(w, http.StatusOK, nil)
}
