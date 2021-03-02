package user

var requestObject = map[string]interface{}{
	"user_id": 1,
}

var invalidObject = map[string]interface{}{
	"user_id": "1",
}

var basePath string = "/organisations/{organisation_id}/applications/{application_id}/users"
var path string = "/organisations/{organisation_id}/applications/{application_id}/users/{user_id}"
