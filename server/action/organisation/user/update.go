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
	"github.com/go-chi/chi"
)

type updateRole struct {
	OrgID int32  `json:"organisation_id"`
	Role  string `json:"role"`
}

func update(w http.ResponseWriter, r *http.Request) {

	var response updateRole
	err := json.NewDecoder(r.Body).Decode(&response)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
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
	err = util.CheckOwner(uint(currentUID), uint(response.OrgID))
	if err != nil {
		loggerx.Error(errors.New("user is not owner"))
		errorx.Render(w, errorx.Parser(errorx.CannotSaveChanges()))
		return
	}
	// Update role in organisation_user table

	userID := chi.URLParam(r, "user_id")
	var uID int
	uID, err = strconv.Atoi(userID)

	tx := model.DB.Begin()
	var orgUser model.OrganisationUser

	err = tx.Where("user_id = ? AND organisation_id = ?", uID, response.OrgID).First(&orgUser).Error
	if err != nil {
		loggerx.Error(errors.New("record not found"))
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		tx.Rollback()
		return
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
			Object:    fmt.Sprintf("org:%d", response.OrgID),
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
			Object:    fmt.Sprintf("org:%d", response.OrgID),
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
