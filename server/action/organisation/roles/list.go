package roles

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/user"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

//list - List role for an organisation using organisation_id
// @Summary List role for an organisation using organisation_id
// @Description List role for an organisation using organisation_id
// @Tags Organisationroles
// @ID get-organisation-role
// @Produce  json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param OrganisationRoleBody body model.OrganisationRole true "Organisation role Body"
// @Success 200 {object} model.OrganisationRole
// @Router /organisations/{organisation_id}/roles [get]

func list(w http.ResponseWriter, r *http.Request) {
	// Get user id from request header
	userID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// Get organisation id from path
	organisationID := chi.URLParam(r, "organisation_id")
	orgID, err := strconv.Atoi(organisationID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// initiating a transaction
	tx := model.DB.Begin()
	// VERIFY WHETHER THE USER IS PART OF ORGANISATION OR NOT
	isAuthorised, err := user.IsUserAuthorised(
		"organisations",
		fmt.Sprintf("org:%d", orgID),
		fmt.Sprintf("%d", userID),
	)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}
	if !isAuthorised {
		loggerx.Error(errors.New("user is not part of the organisation"))
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// list organisation role
	roles := make([]model.OrganisationRole, 0)

	err = tx.Model(&model.OrganisationRole{}).Where(&model.OrganisationRole{
		OrganisationID: uint(orgID),
	}).Preload("Organisation").Preload("Users").Find(&roles).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	tx.Commit()
	renderx.JSON(w, http.StatusOK, roles)
}
