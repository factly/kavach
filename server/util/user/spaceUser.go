package user

import (
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util"
	keto "github.com/factly/kavach-server/util/keto/relationTuple"
	"github.com/factly/x/loggerx"
)

var spaceNameSpace string = "spaces"

func DeleteSpaceUser(spaceID, userID uint) error {
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

	err = DeleteSpaceUserInKeto(space, userID)
	if err != nil {
		return err
	}

	err = DeleteUserFromSpaceRoles(space, userID)
	if err != nil {
		return err
	}
	tx.Commit()
	return nil
}

func DeleteSpaceUserInKeto(space model.Space, userID uint) error {
	kavachRole, err := util.GetKavachRoleByID(userID, space.OrganisationID)
	if err != nil {
		return err
	}

	tuple := &model.KetoRelationTupleWithSubjectID{
		KetoSubjectSet: model.KetoSubjectSet{
			Namespace: spaceNameSpace,
			Object:    fmt.Sprintf("org:%d:app:%d:space:%d", space.OrganisationID, space.ApplicationID, space.ID),
			Relation:  kavachRole, // relation is an empty string to avoid addition of the relation query parameter
		},
		SubjectID: fmt.Sprintf("%d", userID),
	}

	err = keto.DeleteRelationTupleWithSubjectID(tuple)
	if err != nil {
		return err
	}
	return nil
}

func DeleteUserFromSpaceRoles(space model.Space, userID uint) error {
	objects, err := keto.ListObjectsBySubjectID(spaceNameSpace, "", fmt.Sprintf("%d", userID))
	if err != nil {
		return err
	}

	roleIDs := make([]uint, 0)
	for _, object := range objects {
		objectID := fmt.Sprintf("roles:org:%d:app:%d:space:%d:", space.OrganisationID, space.ApplicationID, space.ID)
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
		err = DeleteUserFromSpaceRole(space, roleID, userID)
		if err != nil {
			return err
		}
	}
	return nil
}

func DeleteUserFromSpaceRole(space model.Space, roleID, userID uint) error {
	spaceRole := model.SpaceRole{}
	err := model.DB.Model(&model.SpaceRole{}).Where(&model.SpaceRole{
		Base: model.Base{
			ID: roleID,
		},
	}).Preload("Users").Find(&spaceRole).Error
	if err != nil {
		return err
	}

	err = DeleteUserFromSpaceRoleKeto(space, spaceRole, userID)
	if err != nil {
		return err
	}

	users := make([]model.User, 0)
	for _, user := range spaceRole.Users {
		if user.ID != userID {
			users = append(users, user)
		}
	}

	err = model.DB.Model(&spaceRole).Association("Users").Replace(&users)
	if err != nil {
		return err
	}

	return nil
}

func DeleteUserFromSpaceRoleKeto(space model.Space, spaceRole model.SpaceRole, userID uint) error {
	tuple := &model.KetoRelationTupleWithSubjectID{
		KetoSubjectSet: model.KetoSubjectSet{
			Namespace: spaceNameSpace,
			Object:    fmt.Sprintf("roles:org:%d:app:%d:space:%d:%d", space.OrganisationID, space.OrganisationID, space.ID, spaceRole.ID),
			Relation:  spaceRole.Name,
		},
		SubjectID: fmt.Sprintf("%d", userID),
	}

	err := keto.DeleteRelationTupleWithSubjectID(tuple)
	if err != nil {
		return err
	}

	return nil
}
