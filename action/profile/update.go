package profile

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/renderx"
)

type user struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	BirthDate string `json:"birth_date"`
	Gender    string `json:"gender"`
}

// update of user
func update(w http.ResponseWriter, r *http.Request) {

	req := &user{}
	json.NewDecoder(r.Body).Decode(&req)

	userID, _ := strconv.Atoi(r.Header.Get("X-User"))

	me := &model.User{}
	me.ID = uint(userID)

	err := model.DB.Model(&me).Updates(&model.User{
		FirstName: req.FirstName,
		LastName:  req.LastName,
		BirthDate: req.BirthDate,
		Gender:    req.Gender,
	}).First(&me).Error

	if err != nil {
		return
	}

	renderx.JSON(w, http.StatusOK, me)
}
