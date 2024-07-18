package admin

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/factly/kavach-server/action/admin/organisation"
	"github.com/factly/kavach-server/model"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/slugx"
	"github.com/factly/x/validationx"
	keto "github.com/factly/kavach-server/util/keto/relationTuple"
)

type requestBody struct {
	UserId string `json:"userId"`
	Traits traits `json:"traits"`
}

type traits struct {
	Email      string `json:"email"`
	IsVerified bool   `json:"is_verified"`
	Name       struct {
		First string `json:"first"`
		Last  string `json:"last"`
	} `json:"name"`
}


func afterRegistration(w http.ResponseWriter, r *http.Request) {
	var requestBody requestBody
	err := json.NewDecoder(r.Body).Decode(&requestBody)
	if err != nil {
		loggerx.Error(err)
		return
	}

	email := requestBody.Traits.Email
	firstName := requestBody.Traits.Name.First
	lastName := requestBody.Traits.Name.Last

	user := model.User{
		// make email lowercase to avoid case sensitivity
		Email:       strings.ToLower(email),
		KID:         requestBody.UserId,
		FirstName:   firstName,
		LastName:    lastName,
		DisplayName: firstName+" "+lastName,
		Slug:        slugx.Make(firstName + " " + lastName),
	}

	// check whether user exists
	err = model.DB.Model(&model.User{}).Where(&model.User{
		Email: user.Email,
	}).First(&user).Error

	// user exists so update user
	if err == nil {
		user.IsActive = true
		err = model.DB.Model(&model.User{}).Where("email = ?", user.Email).Updates(&user).Error
		if err != nil {
			loggerx.Error(err)
			return
		}
	}

	if err != nil {
		user.IsActive = true
		// record does not exist so create new user
		var count int64
		err = model.DB.Model(&model.User{}).Where(&model.User{
			Email: user.Email,
		}).Count(&count).Error
		if err != nil {
			loggerx.Error(err)
			return
		}
		if count == 0 {
			err = model.DB.Create(&user).Error
			if err != nil {
				loggerx.Error(err)
				return
			}
		}
	}

	// check if user is invited by any organisation
	invitations := make([]model.Invitation, 0)
	model.DB.Model(&model.Invitation{}).Select("invitations.*").Joins("join users on invitations.invitee_id = users.id").Where("users.email = ?", email).Where("invitations.expired_at > ?", time.Now()).Find(&invitations)

	if len(invitations) > 0{
		return 
	}
	
	// create organisation for user
	org := organisation.Organisation{
		Title:       firstName + " " + lastName,
		Slug:        slugx.Make(firstName + " " + lastName),
		Description: "Default Organisation",
		IsIndividual: true,
		UserID: uint(user.ID),
	}

	err = createOrganisation(org)
	if err != nil {
		loggerx.Error(err)
		return
	}

}

func createOrganisation(org organisation.Organisation) error {
	validationError := validationx.Check(org)
	if validationError != nil {
		return errors.New("validation error")
	}

	mediumID := &org.FeaturedMediumID
	if org.FeaturedMediumID == 0 {
		mediumID = nil
	}

	type contextKey string

	const userContext contextKey = "organisation_user"

	tx := model.DB.WithContext(context.WithValue(context.Background(), userContext, org.UserID)).Begin()

	organisation := &model.Organisation{
		Title:            org.Title,
		Slug:             org.Slug,
		Description:      org.Description,
		FeaturedMediumID: mediumID,
		IsIndividual:     org.IsIndividual,
	}

	err := tx.Model(&model.Organisation{}).Create(&organisation).Error

	if err != nil {
		tx.Rollback()
		return err
	}

	tx.Model(&model.Organisation{}).Preload("Medium").First(&organisation)

	permission := model.OrganisationUser{}
	permission.OrganisationID = uint(organisation.ID)
	permission.UserID = uint(org.UserID)
	permission.Role = "owner"

	err = tx.Model(&model.OrganisationUser{}).Create(&permission).Error

	if err != nil {
		tx.Rollback()
		return err
	}

	// creating the organisation-role: owner, on the keto api
	tuple := &model.KetoRelationTupleWithSubjectID{
		KetoSubjectSet: model.KetoSubjectSet{
			Namespace: "organisations",
			Object:    fmt.Sprintf("org:%d", organisation.ID),
			Relation:  "owner",
		},
		SubjectID: fmt.Sprintf("%d", org.UserID),
	}

	err = keto.CreateRelationTupleWithSubjectID(tuple)
	if err != nil {
		tx.Rollback()
		return err
	}

	var result model.Organisation

	if organisation != nil {
		result = *organisation
	}

	result.OrganisationUsers = []model.OrganisationUser{permission}

	tx.Commit()

	return nil
}