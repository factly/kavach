package organisation

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/util"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/keto"
	"github.com/factly/x/errorx"
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
		util.Log.Error(validationError)
		errorx.Render(w, validationError)
		return
	}

	organisation := &model.Organisation{
		Title: org.Title,
	}

	err := model.DB.Model(&model.Organisation{}).Create(&organisation).Error

	if err != nil {
		util.Log.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	userID, _ := strconv.Atoi(r.Header.Get("X-User"))

	permission := model.OrganisationUser{}
	permission.OrganisationID = organisation.ID
	permission.UserID = uint(userID)
	permission.Role = "owner"

	err = model.DB.Model(&model.OrganisationUser{}).Create(&permission).Error

	if err != nil {
		util.Log.Error(err)
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

	keto.UpdateRole(w, "/engines/acp/ory/regex/roles", reqRole)

	/* creating policy for admins */
	reqPolicy := &model.Policy{}
	reqPolicy.ID = "org:" + fmt.Sprint(organisation.ID) + ":admins"
	reqPolicy.Subjects = []string{reqRole.ID}
	reqPolicy.Resources = []string{"resources:org:" + fmt.Sprint(organisation.ID) + ":<.*>"}
	reqPolicy.Actions = []string{"actions:org:" + fmt.Sprint(organisation.ID) + ":<.*>"}
	reqPolicy.Effect = "allow"

	keto.UpdatePolicy(w, "/engines/acp/ory/regex/policies", reqPolicy)

	renderx.JSON(w, http.StatusCreated, result)
}
