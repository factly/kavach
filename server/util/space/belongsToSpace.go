package space

import (
	"github.com/factly/kavach-server/model"
)

func CheckAuthorisation(spaceID, userID uint) bool {
	space := &model.Space{}
	err := model.DB.Model(&model.Space{}).Where(&model.Space{
		Base: model.Base{
			ID: uint(spaceID),
		},
	}).Preload("Users").Find(&space).Error

	flag := false
	if err != nil {
		return flag
	}

	for _, user := range space.Users {
		if user.ID == uint(userID) {
			flag = true
			break
		}
	}
	return flag
}
