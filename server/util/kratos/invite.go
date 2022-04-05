package kratos

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/spf13/viper"
)

func CreateKratosIdentity(email string) (string, error) {
	reqBody := fmt.Sprintf(`
    {
        "schema_id": "default",
        "traits": {
            "email": "%s"
        }
    }`, email)

	req := strings.NewReader(reqBody)
	response, err := http.Post(viper.GetString("kratos_admin_url")+"/identities", "application/json", req)
	if err != nil {
		return "", err
	}
	defer response.Body.Close()
	responseMap := make(map[string]interface{})
	err = json.NewDecoder(response.Body).Decode(&responseMap)
    if err != nil {
        return "", err
    }
	return responseMap["id"].(string), nil
}
