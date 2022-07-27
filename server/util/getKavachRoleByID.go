package util

import "github.com/factly/kavach-server/model"

func GetKavachRoleByID(userID, orgID uint) (string, error) {
	orgUser := model.OrganisationUser{}
	err := model.DB.Model(&model.OrganisationUser{}).Where(&model.OrganisationUser{
		UserID:         userID,
		OrganisationID: orgID,
	}).First(&orgUser).Error
	if err != nil {
		return "", err
	}
	return orgUser.Role, nil
}
