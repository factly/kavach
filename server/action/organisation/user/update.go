package user

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util"
	keto "github.com/factly/kavach-server/util/keto/relationTuple"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
)

type updateRole struct {
	Role string `json:"role" validate:"required,oneof=owner member"`
}

func update(w http.ResponseWriter, r *http.Request) {
	orgID, err := strconv.Atoi(chi.URLParam(r, "organisation_id"))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	uID, err := strconv.Atoi(chi.URLParam(r, "user_id"))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	var response updateRole
	err = json.NewDecoder(r.Body).Decode(&response)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(response)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	var currentUID int
	currentUID, err = strconv.Atoi(r.Header.Get("X-User"))

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	// Check if logged in user is owner
	err = util.CheckOwner(uint(currentUID), uint(orgID))
	if err != nil {
		loggerx.Error(errors.New("user is not owner"))
		errorx.Render(w, errorx.Parser(errorx.CannotSaveChanges()))
		return
	}
	// Update role in organisation_user table

	tx := model.DB.Begin()
	defer tx.Rollback()
	var orgUser model.OrganisationUser

	err = tx.Where("user_id = ? AND organisation_id = ?", uID, orgID).First(&orgUser).Error
	if err != nil {
		loggerx.Error(errors.New("record not found"))
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		tx.Rollback()
		return
	}

	// Check the user being demoted is not the last owner of organisation
	if orgUser.Role == "owner" && response.Role != "owner" {
		var totalOwners int64
		err = tx.Model(&model.OrganisationUser{}).Where(&model.OrganisationUser{
			Role:           "owner",
			OrganisationID: uint(orgID),
		}).Count(&totalOwners).Error
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
		if totalOwners < 2 {
			loggerx.Error(errors.New("cannot demote last owner of organisation"))
			errorx.Render(w, errorx.Parser(errorx.CannotSaveChanges()))
			return
		}
	}

	err = tx.Model(&model.OrganisationUser{}).Where(&orgUser).Updates(&model.OrganisationUser{Role: response.Role}).Error
	if err != nil {
		loggerx.Error(errors.New("cannot update record"))
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		tx.Rollback()
		return
	}

	// Delete existing relation tuple for user in keto
	deleteExistingtuple := &model.KetoRelationTupleWithSubjectID{
		KetoSubjectSet: model.KetoSubjectSet{
			Namespace: "organisations",
			Object:    fmt.Sprintf("org:%d", orgID),
			Relation:  orgUser.Role,
		},
		SubjectID: fmt.Sprintf("%d", uID),
	}
	err = keto.DeleteRelationTupleWithSubjectID(deleteExistingtuple)
	if err != nil {
		loggerx.Error(errors.New("cannot delete relation tuple"))
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		tx.Rollback()
		return
	}

	// Create new relation tuple in keto based on response
	newTuple := &model.KetoRelationTupleWithSubjectID{
		KetoSubjectSet: model.KetoSubjectSet{
			Namespace: "organisations",
			Object:    fmt.Sprintf("org:%d", orgID),
			Relation:  response.Role,
		},
		SubjectID: fmt.Sprintf("%d", uID),
	}
	err = keto.CreateRelationTupleWithSubjectID(newTuple)
	if err != nil {
		loggerx.Error(errors.New("cannot create relation tuple"))
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		tx.Rollback()
		return
	}
	tx.Commit()
}
