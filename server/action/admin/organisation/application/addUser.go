package application

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/factly/kavach-server/model"
	keto "github.com/factly/kavach-server/util/keto/relationTuple"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

type request struct {
	OrgID  uint `json:"org_id,required"`
	AppID  uint `json:"app_id,required"`
	UserID uint `json:"user_id,required"`
}

// AddUser - add user to application
// req-body: org_id, app_id, user_id
func AddUser(w http.ResponseWriter, r *http.Request) {
	var req request
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	user := &model.OrganisationUser{}
	app := &model.Application{}
	app.ID = uint(req.AppID)

	var userContext model.ContextKey = "application_user"
	tx := model.DB.WithContext(context.WithValue(r.Context(), userContext, req.UserID)).Begin()
	// Check if application exist
	err = tx.Model(&model.Application{}).Preload("Users").First(&app).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}
	// Check if user belongs to organisation
	err = tx.Model(&model.OrganisationUser{}).Where("user_id IN (?) AND organisation_id IN (?)", req.UserID, uint(req.OrgID)).Preload("User").First(&user).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.GetMessage("user does not belong to organisation", http.StatusUnprocessableEntity)))
		return
	}

	users := make([]model.User, 0)
	flag := false
	for _, user := range app.Users {
		if user.ID == uint(req.UserID) {
			flag = true
		}
	}
	// append user to application_user association
	if !flag {
		users = append(app.Users, *user.User)
		app.Users = users
		if err = tx.Model(&app).Association("Users").Replace(&users); err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}
	// creating the association between user and role in the keto db
	tuple := &model.KetoRelationTupleWithSubjectID{
		KetoSubjectSet: model.KetoSubjectSet{
			Namespace: "application",
			Object:    fmt.Sprintf("org:%d:app:%d", req.OrgID, req.AppID),
			Relation:  user.Role,
		},
		SubjectID: fmt.Sprintf("%d", req.UserID),
	}

	userPartofApplication, err := keto.CheckKetoRelationTupleWithSubjectID(tuple)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	if userPartofApplication {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.SameNameExist()))
		return
	}

	err = keto.CreateRelationTupleWithSubjectID(tuple)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	tx.Commit()
	renderx.JSON(w, http.StatusCreated, app)

}
