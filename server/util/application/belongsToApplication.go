package application

import (
	"github.com/factly/kavach-server/model"
)

func CheckAuthorisation(appID, userID uint) bool {
	app := &model.Application{}
	err := model.DB.Model(&model.Application{}).Where(&model.Application{
		Base: model.Base{
			ID: uint(appID),
		},
	}).Preload("Users").Find(&app).Error

	flag := false
	if err != nil {
		return flag
	}

	for _, user := range app.Users {
		if user.ID == uint(userID) {
			flag = true
			break
		}
	}
	return flag
}
