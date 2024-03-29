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

var spaceNameSpace string = "spaces"

func DeleteUserFromSpaces(orgID, appID, userID uint) error {
	spaceObjects, err := keto.ListObjectsBySubjectID(spaceNameSpace, "", fmt.Sprintf("%d", userID))
	if err != nil {
		return err
	}
	spaceIDs := make([]uint, 0)
	for _, object := range spaceObjects {
		objectID := fmt.Sprintf("org:%d:app:%d:", orgID, appID)
		if strings.HasPrefix(object, objectID) {
			splittedObject := strings.Split(object, ":")
			spaceID, err := strconv.Atoi(splittedObject[len(splittedObject)-1])
			if err != nil {
				return err
			}
			spaceIDs = append(spaceIDs, uint(spaceID))
		}
	}
	for _, spaceID := range spaceIDs {
		err = DeleteUserFromSpace(spaceID, userID)
		if err != nil {
			return err
		}
	}
	return nil
}

func DeleteUserFromSpace(spaceID, userID uint) error {
	tx := model.DB.Begin()
	space := model.Space{}
	err := tx.Model(&model.Space{}).Where(&model.Space{
		Base: model.Base{
			ID: spaceID,
		},
	}).Preload("Users").Find(&space).Error
	if err != nil {
		tx.Rollback()
		loggerx.Warning("error in finding space")
		return err
	}
	userAfterDeleting := make([]model.User, 0)
	for _, user := range space.Users {
		if user.ID != userID {
			userAfterDeleting = append(userAfterDeleting, user)
		}
	}
	var count int64
	err = tx.Model(&model.Space{}).Where(&model.Space{
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
		return errors.New("user who created space cannot be deleted")
	}

	err = tx.Model(&space).Association("Users").Replace(&userAfterDeleting)
	if err != nil {
		tx.Rollback()
		return err
	}
	tx.Commit()
	return nil
}
func DeleteUserFromSpaceRoles(orgID uint, appID uint, spaceID uint, userID uint) error {
	objects, err := keto.ListObjectsBySubjectID(spaceNameSpace, "", fmt.Sprintf("%d", userID))
	if err != nil {
		return err
	}

	roleIDs := make([]uint, 0)
	for _, object := range objects {
		objectID := fmt.Sprintf("roles:org:%d:app:%d:space:%d:", orgID, appID, spaceID)
		if strings.HasPrefix(object, objectID) {
			splittedObject := strings.Split(object, ":")
			roleID, err := strconv.Atoi(splittedObject[len(splittedObject)-1])
			if err != nil {
				return err
			}
			roleIDs = append(roleIDs, uint(roleID))
		}
	}

	for _, roleID := range roleIDs {
		err = DeleteUserFromSpaceRole(roleID, userID)
		if err != nil {
			return err
		}
	}
	return nil
}

func DeleteUserFromSpaceRole(roleID, userID uint) error {
	spaceRole := new(model.SpaceRole)
	err := model.DB.Model(&model.SpaceRole{}).Where(&model.SpaceRole{
		Base: model.Base{
			ID: roleID,
		},
	}).Preload("Users").Find(spaceRole).Error
	if err != nil {
		return err
	}

	users := make([]model.User, 0)
	for _, user := range spaceRole.Users {
		if user.ID != userID {
			users = append(users, user)
		}
	}
	spaceRole.ID = roleID
	err = model.DB.Model(spaceRole).Association("Users").Replace(&users)
	if err != nil {
		return err
	}

	return nil
}
