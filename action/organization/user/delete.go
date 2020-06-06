package user

import (
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/render"
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

	permissionID := chi.URLParam(r, "permission_id")
	pID, err := strconv.Atoi(permissionID)

	if err != nil {
		return
	}

	result := &model.OrganizationUser{}
	result.ID = uint(pID)

	err = model.DB.First(&result).Error
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

	/* DELETE */
	model.DB.Delete(&result)

	render.JSON(w, http.StatusOK, nil)
}
