package util

import (
	"bytes"
	"encoding/json"
	"net/http"
	"os"

	"github.com/factly/kavach-server/model"

	"github.com/factly/x/errorx"
)

//UpdateKetoRole: PUT Request to the keto server for policy
func UpdateKetoRole(w http.ResponseWriter, uri string, body *model.Role) {
	buf := new(bytes.Buffer)
	json.NewEncoder(buf).Encode(&body)
	req, err := http.NewRequest("PUT", os.Getenv("KETO_API")+uri, buf)

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
