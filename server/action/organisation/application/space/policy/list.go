package policy

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/space"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

//details - get policy for an application using application_id
// @Summary get policy for an application using application_id
// @Description get policy for an application using application_id
// @Tags OrganisationPolicy
// @ID create-organisation-policy
// @Produce json
// @Param X-User header string true "User ID"
// @Param application_id path string true "Organisation ID"
// @Param OrganisationRoleBody body model.Policy true "Policy"
// @Success 200 {object} model.Organisationrole
// @Router /organisations/{organisation_id}/policy [get]
func list(w http.ResponseWriter, r *http.Request) {
	// Get user id from request header
	userID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// Get space ID path parameter
	sID := chi.URLParam(r, "space_id")
	spaceID, err := strconv.Atoi(sID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// check if the user is part of space or not
	flag := space.CheckAuthorisation(uint(spaceID), uint(userID))
	if !flag {
		loggerx.Error(errors.New("user is not part of space"))
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	// ----------------listing organisation policies by ID from the kavachDB-------------
	policies := make([]model.SpacePolicy, 0)
	err = model.DB.Model(&model.SpacePolicy{}).Where(&model.SpacePolicy{
		SpaceID: uint(spaceID),
	}).Preload("Space").Preload("Permissions").Preload("Roles").Find(&policies).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// sending the JSON response
	renderx.JSON(w, http.StatusOK, policies)
}
