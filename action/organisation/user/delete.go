package user

import (
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// create return all user in organisation
func delete(w http.ResponseWriter, r *http.Request) {
	/* Check if record exist */
	organisationID := chi.URLParam(r, "organisation_id")
	orgID, err := strconv.Atoi(organisationID)

	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	userID := chi.URLParam(r, "user_id")
	uID, err := strconv.Atoi(userID)

	if err != nil {
		return
	}

	result := &model.OrganisationUser{}

	err = model.DB.Where(&model.OrganisationUser{
		OrganisationID: uint(orgID),
		UserID:         uint(uID),
	}).First(&result).Error

	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	/* delete policy for admins */
	if result.Role == "owner" {
		req, err := http.NewRequest("DELETE", os.Getenv("KETO_API")+"/engines/acp/ory/regex/roles/roles:org:"+fmt.Sprint(orgID)+":admin/members/"+fmt.Sprint(result.UserID), nil)

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

	deletePermission := &model.OrganisationUser{}
	deletePermission.ID = result.ID

	/* DELETE */
	model.DB.Delete(&deletePermission)

	renderx.JSON(w, http.StatusOK, nil)
}
