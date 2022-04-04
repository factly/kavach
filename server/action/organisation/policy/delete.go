package policy

import "net/http"

//delete - Delete policy for an organisation using organisation_id
// @Summary Delete policy for an organisation using organisation_id
// @Description Delete policy for an organisation using organisation_id
// @Tags OrganisationPolicy
// @ID delete-organisation-policy
// @Produce json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param OrganisationRoleBody body model.Policy true "Policy"
// @Success 200 {object} model.Organisationrole
// @Router /organisations/{organisation_id}/roles [delete]
func delete(w http.ResponseWriter, r *http.Request) {
	
}
