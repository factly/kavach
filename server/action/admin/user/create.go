package user

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/slugx"
	"github.com/spf13/viper"
)

// create organisation
func create(w http.ResponseWriter, r *http.Request) {
	user := user{}

	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	displayName := ""
	if user.DisplayName == "" {
		displayName = user.FirstName
		if user.LastName != "" {
			displayName = fmt.Sprint(displayName, " ", user.LastName)
		}
	}

	identity := map[string]interface{}{
		"traits": map[string]interface{}{
			"email": user.Email,
			"name": map[string]interface{}{
				"first": user.FirstName,
				"last":  user.LastName,
			},
		},
		"schema_id": "default",
		"credentials": map[string]interface{}{
			"password": map[string]interface{}{
				"config": map[string]interface{}{
					"password": user.Password,
				},
			},
		},
	}

	buf := new(bytes.Buffer)
	err = json.NewEncoder(buf).Encode(&identity)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	req, err := http.NewRequest("POST", viper.GetString("kratos_admin_url")+"/admin/identities", buf)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	client := &http.Client{}
	response, err := client.Do(req)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	responseBody := make(map[string]interface{})

	err = json.NewDecoder(response.Body).Decode(&responseBody)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	result := model.User{
		Email:       user.Email,
		KID:         fmt.Sprint(responseBody["id"]),
		FirstName:   user.FirstName,
		LastName:    user.LastName,
		DisplayName: displayName,
		Slug:        slugx.Make(fmt.Sprint(user.FirstName, " ", user.LastName)),
	}

	// check whether user exists
	err = model.DB.Model(&model.User{}).Create(&result).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
