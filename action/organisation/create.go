package organisation

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/factly/kavach-server/model"
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
		renderx.JSON(w, http.StatusBadRequest, validationError)
		return
	}

	organisation := &model.Organisation{
		Title: org.Title,
	}

	err := model.DB.Model(&model.Organisation{}).Create(&organisation).Error

	if err != nil {
		return
	}

	userID, _ := strconv.Atoi(r.Header.Get("X-User"))

	permission := model.OrganisationUser{}
	permission.OrganisationID = organisation.ID
	permission.UserID = uint(userID)
	permission.Role = "owner"

	err = model.DB.Model(&model.OrganisationUser{}).Create(&permission).Error

	if err != nil {
		return
	}

	result := orgWithRole{}
	result.Organisation = *organisation
	result.Permission = permission

	/* creating role of admins */
	reqRole := &model.Role{}
	reqRole.ID = "roles:org:" + fmt.Sprint(organisation.ID) + ":admin"
	reqRole.Members = []string{fmt.Sprint(userID)}

	buf := new(bytes.Buffer)
	json.NewEncoder(buf).Encode(&reqRole)
	req, err := http.NewRequest("PUT", os.Getenv("KETO_API")+"/engines/acp/ory/regex/roles", buf)

	if err != nil {
		return
	}

	client := &http.Client{}
	_, err = client.Do(req)

	if err != nil {
		return
	}

	/* creating policy for admins */
	reqPolicy := &model.Policy{}
	reqPolicy.ID = "org:" + fmt.Sprint(organisation.ID) + ":admins"
	reqPolicy.Subjects = []string{reqRole.ID}
	reqPolicy.Resources = []string{"resources:org:" + fmt.Sprint(organisation.ID) + ":<.*>"}
	reqPolicy.Actions = []string{"actions:org:" + fmt.Sprint(organisation.ID) + ":<.*>"}
	reqPolicy.Effect = "allow"

	buf = new(bytes.Buffer)
	json.NewEncoder(buf).Encode(&reqPolicy)
	req, err = http.NewRequest("PUT", os.Getenv("KETO_API")+"/engines/acp/ory/regex/policies", buf)

	if err != nil {
		return
	}

	client = &http.Client{}
	_, err = client.Do(req)

	if err != nil {
		return
	}

	renderx.JSON(w, http.StatusCreated, result)
}
