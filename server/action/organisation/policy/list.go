package policy

import "net/http"

//details - get policy for an organisation using organisation_id
// @Summary get policy for an organisation using organisation_id
// @Description get policy for an organisation using organisation_id
// @Tags OrganisationPolicy
// @ID create-organisation-policy
// @Produce json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param OrganisationRoleBody body model.Policy true "Policy"
// @Success 200 {object} model.Organisationrole
// @Router /organisations/{organisation_id}/policy [get]
func list(w http.ResponseWriter, r *http.Request) {

}
