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

	userID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// Only the invitee may decline their own invitation.
	result := model.DB.Where("id = ? AND invitee_id = ?", invID, userID).Delete(&model.Invitation{})
	if result.Error != nil {
		loggerx.Error(result.Error)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	if result.RowsAffected == 0 {
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	renderx.JSON(w, http.StatusOK, nil)
}
