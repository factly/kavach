package test

import (
	"bytes"
	"encoding/json"
	"net/http"

	"github.com/factly/kavach-server/config"
	"github.com/factly/kavach-server/model"
	"gopkg.in/h2non/gock.v1"
)

// MockServer mocks the calls to keto server for testing
func MockServer() error {

	reqRole := &model.Role{}
	reqRole.ID = "roles:org:1:admin"
	reqRole.Members = []string{"1"}

	buf := new(bytes.Buffer)
	err := json.NewEncoder(buf).Encode(reqRole)
	if err != nil {
		return err
	}

	gock.New(config.KetoURL).
		Put("/engines/acp/ory/regex/roles").
		Persist().
		Body(buf).
		Reply(http.StatusOK)

	reqPolicy := &model.Policy{}
	reqPolicy.ID = "org:1:admins"
	reqPolicy.Subjects = []string{"roles:org:1:admin"}
	reqPolicy.Resources = []string{"resources:org:1:<.*>"}
	reqPolicy.Actions = []string{"actions:org:1:<.*>"}
	reqPolicy.Effect = "allow"

	err = json.NewEncoder(buf).Encode(reqPolicy)
	if err != nil {
		return err
	}

	gock.New(config.KetoURL).
		Put("/engines/acp/ory/regex/policies").
		Body(buf).
		Reply(http.StatusOK)

	reqRole = &model.Role{}
	reqRole.Members = []string{"1"}
	err = json.NewEncoder(buf).Encode(reqRole)
	if err != nil {
		return err
	}

	gock.New(config.KetoURL).
		Put("/engines/acp/ory/regex/roles/roles:org:1:admin/members").
		Body(buf).
		Reply(http.StatusOK)

	gock.New(config.KetoURL).
		Delete("/engines/acp/ory/regex/roles/roles:org:1:admin/members/1").
		Reply(http.StatusOK)

	return nil
}
