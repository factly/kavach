package util

import (
	"database/sql"
	"errors"

	"github.com/factly/kavach-server/model"
)

// CheckOwner checks if the given user is owner of organization
func CheckOwner(uid uint, oid uint) error {
	currentUser := model.OrganisationUser{}
	currentUser.UserID = uid
	currentUser.OrganisationID = sql.NullInt32{
		Int32: int32(oid),
		Valid: true,
	}
	currentUser.Role = "owner"

	err := model.DB.Model(&model.OrganisationUser{}).Where(currentUser).First(&model.OrganisationUser{}).Error
	
	if err != nil {
		return errors.New("user is not owner")
	}
	return nil
}
