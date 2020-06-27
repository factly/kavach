package user

import (
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// create return all user in organization
func delete(w http.ResponseWriter, r *http.Request) {
	/* Check if record exist */
	organizationID := chi.URLParam(r, "organization_id")
	orgID, err := strconv.Atoi(organizationID)

	if err != nil {
		return
	}

	userID := chi.URLParam(r, "user_id")
	uID, err := strconv.Atoi(userID)

	if err != nil {
		return
	}

	result := &model.OrganizationUser{}

	err = model.DB.Where(&model.OrganizationUser{
		OrganizationID: uint(orgID),
		UserID:         uint(uID),
	}).First(&result).Error

	if err != nil {
		return
	}

	/* delete policy for admins */
	if result.Role == "owner" {
		req, err := http.NewRequest("DELETE", os.Getenv("KETO_API")+"/engines/acp/ory/regex/roles/roles:org:"+fmt.Sprint(orgID)+":admin/members/"+fmt.Sprint(result.UserID), nil)

		if err != nil {
			return
		}

		client := &http.Client{}
		_, err = client.Do(req)

		if err != nil {
			return
		}
	}

	deletePermission := &model.OrganizationUser{}
	deletePermission.ID = result.ID

	/* DELETE */
	model.DB.Delete(&deletePermission)

	renderx.JSON(w, http.StatusOK, nil)
}
