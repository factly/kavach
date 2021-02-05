package util

import (
	"errors"
	"net/url"
	"strings"

	"github.com/factly/kavach-server/model"
	"github.com/spf13/viper"
)

// GetApplicationID fetches application ID from URL
func GetApplicationID(url url.URL, uID uint) (uint, error) {
	// get organisations for user
	orgUserList := make([]model.OrganisationUser, 0)
	err := model.DB.Model(&model.OrganisationUser{}).Where(&model.OrganisationUser{
		UserID: uID,
	}).Find(&orgUserList).Error
	if err != nil {
		return 0, err
	}

	orgIDs := make([]uint, 0)
	for _, orgUser := range orgUserList {
		orgIDs = append(orgIDs, orgUser.OrganisationID)
	}

	mp := make(map[string]model.Application)
	appList := make([]model.Application, 0)

	// Get all app slugs and make map to check for existence
	model.DB.Model(&model.Application{}).Where("organisation_id IN (?)", orgIDs).Find(&appList)

	for _, app := range appList {
		if app.Slug != "" {
			mp[app.Slug] = app
		}
	}

	strToks := make([]string, 0)
	if viper.IsSet("mode") && viper.GetString("mode") == "development" {
		path := url.Path
		strToks = strings.Split(path, "/")
	} else {
		host := url.Host
		strToks = strings.Split(host, ".")
	}

	for _, st := range strToks {
		if app, found := mp[st]; found {
			return app.ID, nil
		}
	}

	return 0, errors.New("cannot access application")
}
