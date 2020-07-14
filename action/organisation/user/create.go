package user

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
)

type invite struct {
	Email string `json:"email" validate:"required"`
	Role  string `json:"role" validate:"required"`
}

type role struct {
	Members []string `json:"members"`
}

// create return all user in organisation
func create(w http.ResponseWriter, r *http.Request) {
	organisationID := chi.URLParam(r, "organisation_id")
	orgID, err := strconv.Atoi(organisationID)

	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// FindOrCreate invitee
	req := invite{}
	json.NewDecoder(r.Body).Decode(&req)

	validationError := validationx.Check(req)
	if err != nil {
		errorx.Render(w, validationError)
		return
	}

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
			errorx.Render(w, errorx.Parser(errorx.NetworkError()))
			return
		}

		client := &http.Client{}
		_, err = client.Do(req)

		if err != nil {
			errorx.Render(w, errorx.Parser(errorx.NetworkError()))
			return
		}
	}

	// Add user into organisation
	permission := &model.OrganisationUser{}

	permission.OrganisationID = uint(orgID)
	permission.UserID = invitee.ID
	permission.Role = req.Role

	err = model.DB.Model(&model.OrganisationUser{}).Create(&permission).Error

	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	result := &userWithPermission{}

	result.User = invitee
	result.Permission = *permission

	renderx.JSON(w, http.StatusCreated, result)
}
