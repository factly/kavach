package user

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"

	"github.com/factly/identity/model"
	"github.com/factly/identity/util/render"
)

type authenticationSession struct {
	Subject      string                 `json:"subject"`
	Extra        map[string]interface{} `json:"extra"`
	Header       http.Header            `json:"header"`
	MatchContext matchContext           `json:"match_context"`
}

type matchContext struct {
	RegexpCaptureGroups []string `json:"regexp_capture_groups"`
	URL                 *url.URL `json:"url"`
}

// create create organization
func checker(w http.ResponseWriter, r *http.Request) {
	payload := &authenticationSession{}

	json.NewDecoder(r.Body).Decode(&payload)

	user := &model.User{}

	identity := payload.Extra["identity"].(map[string]interface{})
	traits := identity["traits"].(map[string]interface{})

	model.DB.FirstOrCreate(user, &model.User{
		KID:   payload.Subject,
		Email: traits["email"].(string),
	})

	payload.Extra["X-User"] = fmt.Sprint(user.ID)
	render.JSON(w, http.StatusOK, payload)
}
