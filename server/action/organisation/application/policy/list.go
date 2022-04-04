package policy

import "net/http"

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

}
