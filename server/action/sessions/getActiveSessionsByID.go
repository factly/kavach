package sessions

import (
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/kratos"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"gorm.io/gorm"
)

// getActiveSessionsById gets all the active sessions for the user
func getActiveSessionsById(w http.ResponseWriter, r *http.Request) {
	userID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	currentUser := new(model.User)
	err = model.DB.Model(&model.User{}).Where("id = ?", userID).First(&currentUser).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			errorx.Render(w, errorx.Parser(errorx.GetMessage("user not found", http.StatusNotFound)))
			return
		} else {
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	activeSessions, err := kratos.GetActiveSessionByKratosID(currentUser.KID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.GetMessage("error in getting active sessions", http.StatusInternalServerError)))
		return
	}

	renderx.JSON(w, http.StatusOK, activeSessions)
}
