package application

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"

	"github.com/factly/kavach-server/model"
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
// @Router /organisations/{organisation_id}/applications/default [post]
func defaults(w http.ResponseWriter, r *http.Request) {
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

	// Check if user is owner of organisation
	permission := &model.OrganisationUser{}
	err = model.DB.Model(&model.OrganisationUser{}).Where(&model.OrganisationUser{
		OrganisationID: uint(oID),
		UserID:         uint(uID),
		Role:           "owner",
	}).First(permission).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	jsonFile, err := os.Open(DataFile)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	defer jsonFile.Close()

	applications := make([]model.Application, 0)

	byteValue, _ := ioutil.ReadAll(jsonFile)
	err = json.Unmarshal(byteValue, &applications)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	tx := model.DB.Begin()
	user := model.User{}
	user.ID = uint(uID)
	err = tx.Model(&model.User{}).First(&user).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	for i := range applications {
		applications[i].OrganisationID = uint(oID)
		applications[i].Users = []model.User{user}
	}

	err = tx.Model(&model.Application{}).Create(&applications).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// creating the application-role: owner, on the keto api
	for _, app := range applications {
		tuple := &model.KetoRelationTupleWithSubjectID{
			KetoSubjectSet: model.KetoSubjectSet{
				Namespace: namespace,
				Object:    fmt.Sprintf("org:%d:app:%d", oID, app.ID),
				Relation:  "owner",
			},
			SubjectID: fmt.Sprintf("%d", uID),
		}
	
		err = keto.CreateRelationTupleWithSubjectID(tuple)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	tx.Commit()
	renderx.JSON(w, http.StatusCreated, applications)
}
