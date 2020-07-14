package profile

import (
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/renderx"
)

// detail of user
func detail(w http.ResponseWriter, r *http.Request) {

	userID, _ := strconv.Atoi(r.Header.Get("X-User"))

	me := &model.User{}
	me.ID = uint(userID)

	err := model.DB.Model(&model.User{}).First(&me).Error

	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	renderx.JSON(w, http.StatusOK, me)
}
