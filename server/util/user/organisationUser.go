package user

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/factly/kavach-server/model"
	keto "github.com/factly/kavach-server/util/keto/relationTuple"
	"github.com/factly/x/loggerx"
)

var organisationNameSpace string = "organisations"

func DeleteUserFromOrganisationRoles(orgID uint, userID uint) error {
	orgObjects, err := keto.ListObjectsBySubjectID(organisationNameSpace, "", fmt.Sprintf("%d", userID))
	if err != nil {
		loggerx.Error(err)
		return err
	}
	appObjects, err := keto.ListObjectsBySubjectID(applicationNameSpace, "", fmt.Sprintf("%d", userID))
	if err != nil {
		loggerx.Error(err)
		return err
	}
	spaceObjects, err := keto.ListObjectsBySubjectID(spaceNameSpace, "", fmt.Sprintf("%d", userID))
	if err != nil {
		loggerx.Error(err)
		return err
	}
	orgRoleIDs := make([]uint, 0)
	for _, object := range orgObjects {
		objectID := fmt.Sprintf("roles:org:%d:", orgID)
		if strings.HasPrefix(object, objectID) {
			splittedObject := strings.Split(object, ":")
			roleID, err := strconv.Atoi(splittedObject[len(splittedObject)-1])
			if err != nil {
				loggerx.Error(err)
				return err
			}
			orgRoleIDs = append(orgRoleIDs, uint(roleID))
		}
	}
	appRoleIDs := make([]uint, 0)
	for _, object := range appObjects {
		objectID := fmt.Sprintf("roles:org:%d:", orgID)
		if strings.HasPrefix(object, objectID) {
			splittedObject := strings.Split(object, ":")
			roleID, err := strconv.Atoi(splittedObject[len(splittedObject)-1])
			if err != nil {
				loggerx.Error(err)
				return err
			}
			appRoleIDs = append(appRoleIDs, uint(roleID))
		}
	}
	spaceRoleIDs := make([]uint, 0)
	for _, object := range spaceObjects {
		objectID := fmt.Sprintf("roles:org:%d:", orgID)
		if strings.HasPrefix(object, objectID) {
			splittedObject := strings.Split(object, ":")
			roleID, err := strconv.Atoi(splittedObject[len(splittedObject)-1])
			if err != nil {
				loggerx.Error(err)
				return err
			}
			spaceRoleIDs = append(spaceRoleIDs, uint(roleID))
		}
	}
	for _, roleID := range orgRoleIDs {
		err = DeleteUserFromOrganisationRole(roleID, userID)
		if err != nil {
			loggerx.Error(err)
			return err
		}
	}
	for _, roleID := range appRoleIDs {
		err = DeleteUserFromApplicationRole(roleID, userID)
		if err != nil {
			loggerx.Error(err)
			return err
		}
	}
	for _, roleID := range spaceRoleIDs {
		err = DeleteUserFromSpaceRole(roleID, userID)
		if err != nil {
			loggerx.Error(err)
			return err
		}
	}
	return nil
}

func DeleteUserFromOrganisationRole(roleID, userID uint) error {
	organisationRole := new(model.OrganisationRole)
	err := model.DB.Model(&model.OrganisationRole{}).Where(&model.OrganisationRole{
		Base: model.Base{
			ID: roleID,
		},
	}).Preload("Users").Find(organisationRole).Error
	if err != nil {
		loggerx.Error(err)
		return err
	}
	users := make([]model.User, 0)
	for _, user := range organisationRole.Users {
		if user.ID != userID {
			users = append(users, user)
		}
	}
	organisationRole.ID = roleID
	err = model.DB.Model(organisationRole).Association("Users").Replace(&users)
	if err != nil {
		loggerx.Error(err)
		return err
	}

	return nil
}
