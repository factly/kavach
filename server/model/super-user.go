package model

import (
	"errors"

	emailPackage "github.com/factly/kavach-server/util/email"
	"github.com/factly/kavach-server/util/kratos"
	"github.com/factly/x/loggerx"
	"github.com/spf13/viper"
)

func CreateSuperUser() error {
	if !viper.GetBool("disable_registration") {
		return errors.New("registration is enabled. cannot create super user. please disable registration to create super user")
	}
	SetupDB()
	email := viper.GetString("super_user_email")
	var user User
	tx := DB.Begin()
	result := tx.Model(User{}).First(&user)
	if result.RowsAffected > 0 {
		loggerx.Info("super user already exists")
		return nil
	}

	kID, err := kratos.CreateKratosIdentity(email)
	if err != nil {
		loggerx.Error(err)
		return err
	}
	var response *kratos.RecoveryResponse
	response, err = kratos.CreateRecoveryLink("168h", kID)
	if err != nil {
		loggerx.Error(err)
		return err
	}

	user = User{
		Email: email,
		KID:   kID,
	}
	err = tx.Model(User{}).Create(&user).Error
	if err != nil {
		loggerx.Error(err)
		return err
	}

	var emailObj emailPackage.MailReceiver
	emailObj.InviteeEmail = email
	emailObj.OrganisationName = "Kavach"
	emailObj.ActionURL = response.RecoveryURL
	emailObj.Role = "Super User"
	emailObj.InviteeName = ""
	err = emailPackage.SendmailwithSendGrid(emailObj)
	if err != nil {
		loggerx.Error(err)
		return err
	}
	tx.Commit()
	return nil
}
