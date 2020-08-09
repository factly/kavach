package user

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/util"
	"github.com/factly/kavach-server/util/keto"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
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
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	var currentUID int
	currentUID, err = strconv.Atoi(r.Header.Get("X-User"))

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	// Check if logged in user is owner
	err = util.CheckOwner(uint(currentUID), uint(orgID))

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.CannotSaveChanges()))
		return
	}

	// FindOrCreate invitee
	req := invite{}
	json.NewDecoder(r.Body).Decode(&req)

	validationError := validationx.Check(req)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	tx := model.DB.Begin()

	invitee := model.User{}

	tx.FirstOrCreate(&invitee, &model.User{
		Email: req.Email,
	})

	// Check if invitee already exist in organisation
	var totPermissions int
	permission := &model.OrganisationUser{}
	permission.OrganisationID = uint(orgID)
	permission.UserID = invitee.ID

	model.DB.Model(&model.OrganisationUser{}).Where(permission).Count(&totPermissions)

	if totPermissions != 0 {
		loggerx.Error(errors.New("User already exist in organisation"))
		errorx.Render(w, errorx.Parser(errorx.CannotSaveChanges()))
		return
	}

	if req.Role == "owner" {
		/* creating policy for admins */
		reqRole := &model.Role{}
		reqRole.Members = []string{fmt.Sprint(invitee.ID)}

		err = keto.UpdateRole("/engines/acp/ory/regex/roles/roles:org:"+fmt.Sprint(orgID)+":admin/members", reqRole)

		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.NetworkError()))
			return
		}
	}

	// Add user into organisation
	permission.OrganisationID = uint(orgID)
	permission.UserID = invitee.ID
	permission.Role = req.Role

	err = tx.Model(&model.OrganisationUser{}).Create(&permission).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Commit()

	result := &userWithPermission{}

	result.User = invitee
	result.Permission = *permission

	renderx.JSON(w, http.StatusCreated, result)
}
