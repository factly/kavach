package util

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/spf13/viper"
)

// getOrganisationUsingMasterKey gives out response which consists organisation data and the organisation users
func getOrganisationUsingMasterKey(w http.ResponseWriter, r *http.Request) {
	requestMasterKey := r.Header.Get("X-KAVACH-MASTER-KEY")
	if requestMasterKey != viper.GetString("master_key") {
		loggerx.Error(errors.New("request has invalid MASTER_KEY"))
		errorx.Render(w, errorx.Parser(errorx.GetMessage("X-KAVACH-MASTER-KEY header is invalid ", http.StatusUnauthorized)))
		return
	}

	organisationID, err := strconv.Atoi(r.Header.Get("X-ORGANISATION"))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.GetMessage("X-ORGANISATION header is invalid ", http.StatusUnauthorized)))
		return
	}

	orgData := new(model.Organisation)
	err = model.DB.Model(&model.Organisation{}).Where(&model.Organisation{
		Base: model.Base{
			ID: uint(organisationID),
		},
	}).Preload("OrganisationUsers").Preload("OrganisationUsers.User").Find(&orgData).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusOK, orgData)
}
