package util

import (
	"errors"

	"github.com/factly/kavach-server/model"
)

func GetOrganisationRoleByID(roleID uint) (*string, error) {
	// getting the organisation role name using roleID
	roleMap := make(map[string]interface{})
	err := model.DB.Model(&model.OrganisationRole{}).Where(&model.OrganisationRole{
		Base: model.Base{
			ID: uint(roleID),
		},
	},
	).Pluck("name", &roleMap).Error

	if err != nil {
		return nil, err
	}

	role, ok := roleMap["name"].(string)
	if !ok {
		return nil, errors.New("no name role present")
	}
	return &role, nil
}

func GetApplicationRoleByID(roleID uint) (*string, error) {
	// getting the application role name using roleID
	roleMap := make(map[string]interface{})
	err := model.DB.Model(&model.ApplicationRole{}).Where(&model.ApplicationRole{
		Base: model.Base{
			ID: uint(roleID),
		},
	},
	).Pluck("name", &roleMap).Error

	if err != nil {
		return nil, err
	}

	role, ok := roleMap["name"].(string)
	if !ok {
		return nil, errors.New("no name role present")
	}
	return &role, nil
}

func GetSpaceRoleByID(roleID uint) (*string, error) {
	// getting the space role name using roleID
	roleMap := make(map[string]interface{})
	err := model.DB.Model(&model.SpaceRole{}).Where(&model.SpaceRole{
		Base: model.Base{
			ID: uint(roleID),
		},
	},
	).Pluck("name", &roleMap).Error

	if err != nil {
		return nil, err
	}

	role, ok := roleMap["name"].(string)
	if !ok {
		return nil, errors.New("no name role present")
	}
	return &role, nil
}
