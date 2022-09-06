package application

import (
	"fmt"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/user"
)

const namespace string = "applications"

func GetDefaultApplicationByOrgID(userID, orgID uint) ([]model.Application, error) {
	// VERIFY WHETHER THE USER IS PART OF Application OR NOT
	if orgID == 1 {
		return []model.Application{}, nil
	}

	apps := make([]model.Application, 0)
	err := model.DB.Model(&model.Application{}).Where(&model.Application{
		IsDefault: true,
	}).Find(&apps).Error
	if err != nil {
		return nil, err
	}

	filteredApps := make([]model.Application, 0)

	for _, app := range apps {
		isAuthorised, err := user.IsUserAuthorised(
			namespace,
			fmt.Sprintf("org:%d:app:%d", orgID, app.ID),
			fmt.Sprintf("%d", userID),
		)
		if err != nil {
			return nil, err
		}
		if isAuthorised {
			filteredApps = append(filteredApps, app)
		}
	}
	
	return filteredApps, nil
}

