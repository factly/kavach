package profile

import (
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

// detail - Get logged in user details
// @Summary Get logged in user details
// @Description Get logged in user details
// @Tags Profile
// @ID get-logged-in-user
// @Produce json
// @Param X-User header string true "User ID"
// @Success 200 {object} model.User
// @Router /profile [get]
func detail(w http.ResponseWriter, r *http.Request) {

	userID, err := strconv.Atoi(r.Header.Get("X-User"))

	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	me := &model.User{}
	me.ID = uint(userID)

	err = model.DB.Model(&model.User{}).First(&me).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	renderx.JSON(w, http.StatusOK, me)
}
