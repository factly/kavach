package model

// Migration does database migrations
func Migration() {
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
	)
}
