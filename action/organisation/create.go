package organisation

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/keto"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
)

type organisation struct {
	Title string `json:"title" validate:"required"`
}

// create create organisation
func create(w http.ResponseWriter, r *http.Request) {
	org := &organisation{}

	json.NewDecoder(r.Body).Decode(&org)

	validationError := validationx.Check(org)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	organisation := &model.Organisation{
		Title: org.Title,
	}

	tx := model.DB.Begin()

	err := tx.Model(&model.Organisation{}).Create(&organisation).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	userID, _ := strconv.Atoi(r.Header.Get("X-User"))

	permission := model.OrganisationUser{}
	permission.OrganisationID = organisation.ID
	permission.UserID = uint(userID)
	permission.Role = "owner"

	err = tx.Model(&model.OrganisationUser{}).Create(&permission).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	result := orgWithRole{}
	result.Organisation = *organisation
	result.Permission = permission

	/* creating role of admins */
	reqRole := &model.Role{}
	reqRole.ID = "roles:org:" + fmt.Sprint(organisation.ID) + ":admin"
	reqRole.Members = []string{fmt.Sprint(userID)}

	err = keto.UpdateRole("/engines/acp/ory/regex/roles", reqRole)

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.NetworkError()))
		return
	}

	/* creating policy for admins */
	reqPolicy := &model.Policy{}
	reqPolicy.ID = "org:" + fmt.Sprint(organisation.ID) + ":admins"
	reqPolicy.Subjects = []string{reqRole.ID}
	reqPolicy.Resources = []string{"resources:org:" + fmt.Sprint(organisation.ID) + ":<.*>"}
	reqPolicy.Actions = []string{"actions:org:" + fmt.Sprint(organisation.ID) + ":<.*>"}
	reqPolicy.Effect = "allow"

	err = keto.UpdatePolicy("/engines/acp/ory/regex/policies", reqPolicy)

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.NetworkError()))
		return
	}

	tx.Commit()

	renderx.JSON(w, http.StatusCreated, result)
}
