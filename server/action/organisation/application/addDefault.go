package application

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util"
	keto "github.com/factly/kavach-server/util/keto/relationTuple"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// DataFile default json data file
var DataFile = "./data/applications.json"

// defaults - Create Default applications
// @Summary Create Default applications
// @Description Create Default applications
// @Tags OrganisationApplications
// @ID add-default-applications
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Success 201 {object} []model.Application
// @Failure 400 {array} string
// @Router /organisations/{organisation_id}/applications/{application_id}/default [post]
func addDefault(w http.ResponseWriter, r *http.Request) {
	uID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	organisationID := chi.URLParam(r, "organisation_id")
	oID, err := strconv.Atoi(organisationID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}
	if oID == 1 {
		loggerx.Error(errors.New("cannot add default applications for super organisation"))
		errorx.Render(w, errorx.Parser(errorx.CannotSaveChanges()))
		return
	}
	err = util.CheckOwner(uint(uID), uint(oID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	applicationID := chi.URLParam(r, "application_id")
	appID, err := strconv.Atoi(applicationID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	tx := model.DB.Begin()
	app := model.Application{}
	err = tx.Model(&model.Application{}).Where(&model.Application{
		Base: model.Base{
			ID: uint(appID),
		},
	}).Preload("Organisations").Preload("Users").First(&app).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	for _, org := range app.Organisations {
		if org.ID == uint(oID) {
			tx.Rollback()
			loggerx.Error(errors.New("organisation already exists"))
			errorx.Render(w, errorx.Parser(errorx.CannotSaveChanges()))
			return
		}
	}

	org := &model.Organisation{}
	err = tx.Model(&model.Organisation{}).Where(&model.Organisation{
		Base: model.Base{
			ID: uint(oID),
		},
	}).First(org).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	newOrganisations := append(app.Organisations, *org)
	err = tx.Model(&app).Association("Organisations").Replace(&newOrganisations)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	// Add current user in application_users
	newUsers := app.Users
	newUser := model.User{}
	err = tx.Model(&model.User{}).Where(&model.User{
		Base: model.Base{
			ID: uint(uID),
		},
	}).Find(&newUser).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	newUsers = append(newUsers, newUser)
	err = tx.Model(&app).Association("Users").Replace(&newUsers)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	//get the role from user id
	role, err := util.GetKavachRoleByID(uint(uID), uint(oID))
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	// creating the application-role: owner, on the keto api
	tuple := &model.KetoRelationTupleWithSubjectID{
		KetoSubjectSet: model.KetoSubjectSet{
			Namespace: namespace,
			Object:    fmt.Sprintf("org:%d:app:%d", oID, app.ID),
			Relation:  role,
		},
		SubjectID: fmt.Sprintf("%d", uID),
	}

	err = keto.CreateRelationTupleWithSubjectID(tuple)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	tx.Commit()
	renderx.JSON(w, http.StatusCreated, nil)
}
