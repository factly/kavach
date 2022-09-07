package model

import "github.com/factly/x/loggerx"

// Migration does database migrations
func Migration() {
	loggerx.Init()
	_ = DB.AutoMigrate(
		&Organisation{},
		&User{},
		&OrganisationUser{},
		&Medium{},
		&Application{},
		&ApplicationToken{},
		&Invitation{},
		&Space{},
		&SpaceToken{},
		&OrganisationToken{},
		&OrganisationRole{},
		&ApplicationRole{},
		&SpaceRole{},
		&OrganisationPolicy{},
		&ApplicationPolicy{},
		&SpacePolicy{},
	)
}
