package user

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/slugx"
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

// create organisation
func checker(w http.ResponseWriter, r *http.Request) {
	payload := &authenticationSession{}

	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	identity := payload.Extra["identity"].(map[string]interface{})
	traits := identity["traits"].(map[string]interface{})

	var firstName, lastName string
	if _, ok := traits["first_name"]; ok {
		firstName = traits["first_name"].(string)
	}

	if _, ok := traits["last_name"]; ok {
		lastName = traits["last_name"].(string)
	}

	user := model.User{
		Email:     traits["email"].(string),
		FirstName: firstName,
		LastName:  lastName,
		Slug:      slugx.Make(fmt.Sprint(firstName, " ", lastName)),
	}

	// FirstOrCreate user
	model.DB.FirstOrCreate(&user, &model.User{
		Email: traits["email"].(string),
	})

	payload.Header = make(http.Header)

	payload.Header.Add("X-User", fmt.Sprint(user.ID))
	renderx.JSON(w, http.StatusOK, payload)
}

/*
{
    "subject": "cc2ab548-a743-4c25-a83a-34d19723df2d",
    "extra": {
        "authenticated_at": "2020-05-08T12:48:05.787486Z",
        "expires_at": "2020-05-08T13:48:05.787486Z",
        "identity": {
            "addresses": [
                {
                    "expires_at": "2020-05-07T10:19:26.758347Z",
                    "id": "73cc9081-64b2-4245-a9bd-a4661760a575",
                    "value": "monark2@factly.in",
                    "verified": false,
                    "verified_at": null,
                    "via": "email"
                }
            ],
            "id": "cc2ab548-a743-4c25-a83a-34d19723df2d",
            "traits": {
                "email": "monark2@factly.in"
            },
            "traits_schema_id": "default",
            "traits_schema_url": "http://127.0.0.1:4455/.ory/kratos/public/schemas/default"
        },
        "issued_at": "2020-05-08T12:48:05.787921Z",
        "sid": "9ac95dad-9509-476f-95e9-e576bf59a294"
    },
    "header": {
        "Authorization": [
            "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImEyYWE5NzM5LWQ3NTMtNGEwZC04N2VlLTYxZjEwMTA1MDI3NyIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1ODkwMjkyODYsImlhdCI6MTU4OTAyODM4NiwiaXNzIjoiaHR0cDovLzEyNy4wLjAuMTo0NDU1LyIsImp0aSI6IjY1ZmRkZTM1LWMzZmQtNGE2NS1hMDEzLTQ0MDg1NGQ5ZDc0YyIsIm5iZiI6MTU4OTAyODM4Niwic2Vzc2lvbiI6eyJhdXRoZW50aWNhdGVkX2F0IjoiMjAyMC0wNS0wOFQxMjo0ODowNS43ODc0ODZaIiwiZXhwaXJlc19hdCI6IjIwMjAtMDUtMDhUMTM6NDg6MDUuNzg3NDg2WiIsImlkZW50aXR5Ijp7ImFkZHJlc3NlcyI6W3siZXhwaXJlc19hdCI6IjIwMjAtMDUtMDdUMTA6MTk6MjYuNzU4MzQ3WiIsImlkIjoiNzNjYzkwODEtNjRiMi00MjQ1LWE5YmQtYTQ2NjE3NjBhNTc1IiwidmFsdWUiOiJtb25hcmsyQGZhY3RseS5pbiIsInZlcmlmaWVkIjpmYWxzZSwidmVyaWZpZWRfYXQiOm51bGwsInZpYSI6ImVtYWlsIn1dLCJpZCI6ImNjMmFiNTQ4LWE3NDMtNGMyNS1hODNhLTM0ZDE5NzIzZGYyZCIsInRyYWl0cyI6eyJlbWFpbCI6Im1vbmFyazJAZmFjdGx5LmluIn0sInRyYWl0c19zY2hlbWFfaWQiOiJkZWZhdWx0IiwidHJhaXRzX3NjaGVtYV91cmwiOiJodHRwOi8vMTI3LjAuMC4xOjQ0NTUvLm9yeS9rcmF0b3MvcHVibGljL3NjaGVtYXMvZGVmYXVsdCJ9LCJpc3N1ZWRfYXQiOiIyMDIwLTA1LTA4VDEyOjQ4OjA1Ljc4NzkyMVoiLCJzaWQiOiI5YWM5NWRhZC05NTA5LTQ3NmYtOTVlOS1lNTc2YmY1OWEyOTQifSwic3ViIjoiY2MyYWI1NDgtYTc0My00YzI1LWE4M2EtMzRkMTk3MjNkZjJkIn0.FLjoZIYbv9HLuCGJD4GErwY1CboTsmpKg7UdoAe_CouwfNlEENgwC9zJyOLsK-ialHnFGadkRg_GjLVleBbobvypOHADfgai6_fpPRVVh6iB9tKFaa5VJ3jvSJ1zxtkFKkGqjytgqx1UauC7xpPwKg4JtnoFBVNvnbU7l4ZzkGtt-KwEMROFUEK1Kxm-QKyEYPJzg6ffhQm7BiZ02E5HLN94Hr8B2MpuzMiyJXpuTusjoLgQXHQXfI1YZv65fo9sQ5SMt_K0g0XNYQqh_yYTpCyMySJ_2RbJxRht_DA1qXdhY5L3n-PJqzuhr6ehdXGlfBEDtMQF0ZBtfgyIkgTc2Q"
        ],
        "X-Kratos": [
            "cc2ab548-a743-4c25-a83a-34d19723df2d"
        ]
    },
    "match_context": {
        "regexp_capture_groups": [
            "tags"
        ],
        "url": {
            "Scheme": "http",
            "Opaque": "",
            "User": null,
            "Host": "127.0.0.1:4455",
            "Path": "/.factly/data-portal/server/tags",
            "RawPath": "",
            "ForceQuery": false,
            "RawQuery": "",
            "Fragment": ""
        }
    }
}
*/
