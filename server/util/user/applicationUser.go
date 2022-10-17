package user

import (
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/factly/kavach-server/model"
	keto "github.com/factly/kavach-server/util/keto/relationTuple"
	"github.com/factly/x/loggerx"
)

var applicationNameSpace string = "applications"

func DeleteUserFromApplicationRoles(orgID uint, appID uint, userID uint) error {
	appObjects, err := keto.ListObjectsBySubjectID(applicationNameSpace, "", fmt.Sprintf("%d", userID))
	if err != nil {
		return err
	}
	spaceObjects, err := keto.ListObjectsBySubjectID(spaceNameSpace, "", fmt.Sprintf("%d", userID))
	if err != nil {
		return err
	}
	appRoleIDs := make([]uint, 0)
	for _, object := range appObjects {
		objectID := fmt.Sprintf("roles:org:%d:app:%d:", orgID, appID)
		if strings.HasPrefix(object, objectID) {
			splittedObject := strings.Split(object, ":")
			roleID, err := strconv.Atoi(splittedObject[len(splittedObject)-1])
			if err != nil {
				return err
			}
			appRoleIDs = append(appRoleIDs, uint(roleID))
		}
	}
	spaceRoleIDs := make([]uint, 0)
	for _, object := range spaceObjects {
		objectID := fmt.Sprintf("roles:org:%d:app:%d:", orgID, appID)
		if strings.HasPrefix(object, objectID) {
			splittedObject := strings.Split(object, ":")
			roleID, err := strconv.Atoi(splittedObject[len(splittedObject)-1])
			if err != nil {
				return err
			}
			spaceRoleIDs = append(spaceRoleIDs, uint(roleID))
		}
	}

	for _, roleID := range appRoleIDs {
		err = DeleteUserFromApplicationRole(roleID, userID)
		if err != nil {
			return err
		}
	}
	for _, roleID := range spaceRoleIDs {
		err = DeleteUserFromSpaceRole(roleID, userID)
		if err != nil {
			return err
		}
	}
	return nil
}

func DeleteUserFromApplicationRole(roleID, userID uint) error {
	applicationRole := new(model.ApplicationRole)
	err := model.DB.Model(&model.ApplicationRole{}).Where(&model.ApplicationRole{
		Base: model.Base{
			ID: roleID,
		},
	}).Preload("Users").Find(applicationRole).Error
	if err != nil {
		loggerx.Error(err)
		return err
	}
	users := make([]model.User, 0)
	for _, user := range applicationRole.Users {
		if user.ID != userID {
			users = append(users, user)
		}
	}
	applicationRole.ID = roleID
	err = model.DB.Model(applicationRole).Association("Users").Replace(&users)
	if err != nil {
		loggerx.Error(err)
		return err
	}

	return nil
}

func DeleteUserFromApplications(orgID, userID uint) error {
	appObjects, err := keto.ListObjectsBySubjectID(applicationNameSpace, "", fmt.Sprintf("%d", userID))
	if err != nil {
		return err
	}
	appIDs := make([]uint, 0)
	for _, object := range appObjects {
		objectID := fmt.Sprintf("org:%d:", orgID)
		if strings.HasPrefix(object, objectID) {
			splittedObject := strings.Split(object, ":")
			appID, err := strconv.Atoi(splittedObject[len(splittedObject)-1])
			if err != nil {
				return err
			}
			appIDs = append(appIDs, uint(appID))
		}
	}
	for _, appID := range appIDs {
		err = DeleteUserFromApplication(appID, userID)
		if err != nil {
			return err
		}
		err = DeleteUserFromSpaces(orgID, appID, userID)
		if err != nil {
			return err
		}
	}

	return nil

}

func DeleteUserFromApplication(appID, userID uint) error {
	tx := model.DB.Begin()
	app := model.Application{}
	err := tx.Model(&model.Application{}).Where(&model.Application{
		Base: model.Base{
			ID: appID,
		},
	}).Preload("Users").Find(&app).Error
	if err != nil {
		tx.Rollback()
		loggerx.Warning("error in finding app")
		return err
	}
	userAfterDeleting := make([]model.User, 0)
	for _, user := range app.Users {
		if user.ID != userID {
			userAfterDeleting = append(userAfterDeleting, user)
		}
	}
	var count int64
	err = tx.Model(&model.Application{}).Where(&model.Application{
		Base: model.Base{
			CreatedByID: uint(userID),
		},
	}).Count(&count).Error

	if err != nil {
		tx.Rollback()
		return err
	}
	if count != 0 {
		tx.Rollback()
		return errors.New("user who created app cannot be deleted")
	}

	err = tx.Model(&app).Association("Users").Replace(&userAfterDeleting)
	if err != nil {
		tx.Rollback()
		return err
	}
	tx.Commit()
	return nil
}
