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
	appIDs := []uint{1, 2, 3, 4}
	apps := []model.Application{}
	for _, appID := range appIDs {
		isAuthorised, err := user.IsUserAuthorised(
			namespace,
			fmt.Sprintf("org:%d:app:%d", orgID, appID),
			fmt.Sprintf("%d", userID),
		)
		if err != nil {
			return nil, err
		}

		if isAuthorised {
			app := model.Application{}
			err := model.DB.Model(&model.Application{}).Where(&model.Application{
				Base: model.Base{
					ID: appID,
				},
			}).First(&app).Error
			if err != nil {
				return nil, err
			}

			apps = append(apps, app)
		}
	}
	return apps, nil
}
