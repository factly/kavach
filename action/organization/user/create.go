package user

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/render"
	"github.com/go-chi/chi"
)

type invite struct {
	Email string `json:"email"`
	Role  string `json:"role"`
}

type role struct {
	Members []string `json:"members"`
}

// create return all user in organization
func create(w http.ResponseWriter, r *http.Request) {
	organizationID := chi.URLParam(r, "organization_id")
	orgID, err := strconv.Atoi(organizationID)

	if err != nil {
		return
	}

	// FindOrCreate invitee
	req := invite{}
	json.NewDecoder(r.Body).Decode(&req)

	invitee := model.User{}

	model.DB.FirstOrCreate(&invitee, &model.User{
		Email: req.Email,
	})

	if req.Role == "owner" {
		/* creating policy for admins */
		reqRole := &model.Role{}
		reqRole.Members = []string{fmt.Sprint(invitee.ID)}

		buf := new(bytes.Buffer)
		json.NewEncoder(buf).Encode(&reqRole)
		req, err := http.NewRequest("PUT", os.Getenv("KETO_API")+"/engines/acp/ory/regex/roles/roles:org:"+fmt.Sprint(orgID)+":admin/members", buf)

		if err != nil {
			return
		}

		client := &http.Client{}
		_, err = client.Do(req)

		if err != nil {
			return
		}
	}

	// Add user into organization
	result := &model.OrganizationUser{}

	result.OrganizationID = uint(orgID)
	result.UserID = invitee.ID
	result.Role = req.Role

	err = model.DB.Model(&model.OrganizationUser{}).Create(&result).Error

	if err != nil {
		return
	}

	model.DB.Model(&model.OrganizationUser{}).Preload("User").First(&result)

	render.JSON(w, http.StatusCreated, result)
}
