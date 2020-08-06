package keto

import (
	"bytes"
	"encoding/json"
	"net/http"
	"os"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util"
	"github.com/factly/x/errorx"
)

// UpdatePolicy PUT request to keto server to update the policy
func UpdatePolicy(w http.ResponseWriter, uri string, body *model.Policy) {
	buf := new(bytes.Buffer)
	json.NewEncoder(buf).Encode(&body)
	req, err := http.NewRequest("PUT", os.Getenv("KETO_API")+uri, buf)

	if err != nil {
		util.Log.Error(err)
		errorx.Render(w, errorx.Parser(errorx.NetworkError()))
		return
	}

	client := &http.Client{}
	_, err = client.Do(req)

	if err != nil {
		util.Log.Error(err)
		errorx.Render(w, errorx.Parser(errorx.NetworkError()))
		return
	}
}

// DeletePolicy DELETE request to keto server to delete policy
func DeletePolicy(w http.ResponseWriter, uri string) {
	req, err := http.NewRequest("DELETE", os.Getenv("KETO_API")+uri, nil)

	if err != nil {
		util.Log.Error(err)
		errorx.Render(w, errorx.Parser(errorx.NetworkError()))
		return
	}

	client := &http.Client{}
	_, err = client.Do(req)

	if err != nil {
		util.Log.Error(err)
		errorx.Render(w, errorx.Parser(errorx.NetworkError()))
		return
	}
}
