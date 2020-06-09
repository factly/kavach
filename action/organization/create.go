package organization

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/renderx"
)

// create create organization
func create(w http.ResponseWriter, r *http.Request) {
	organization := &model.Organization{}

	json.NewDecoder(r.Body).Decode(&organization)

	err := model.DB.Model(&model.Organization{}).Create(&organization).Error

	if err != nil {
		return
	}

	userID, _ := strconv.Atoi(r.Header.Get("X-User"))

	permission := model.OrganizationUser{}
	permission.OrganizationID = organization.ID
	permission.UserID = uint(userID)
	permission.Role = "owner"

	err = model.DB.Model(&model.OrganizationUser{}).Create(&permission).Error

	if err != nil {
		return
	}

	result := orgWithRole{}
	result.Organization = *organization
	result.Permission = permission

	/* creating role of admins */
	reqRole := &model.Role{}
	reqRole.ID = "roles:org:" + fmt.Sprint(organization.ID) + ":admin"
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
	reqPolicy.ID = "org:" + fmt.Sprint(organization.ID) + ":admins"
	reqPolicy.Subjects = []string{reqRole.ID}
	reqPolicy.Resources = []string{"resources:org:" + fmt.Sprint(organization.ID) + ":<.*>"}
	reqPolicy.Actions = []string{"actions:org:" + fmt.Sprint(organization.ID) + ":<.*>"}
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
