package model

// Migration does database migrations
func Migration() {
	DB.AutoMigrate(
		&Organisation{},
		&User{},
		&OrganisationUser{},
	)

	// Adding foreignKey
	DB.Model(&OrganisationUser{}).AddForeignKey("user_id", "users(id)", "RESTRICT", "RESTRICT")
	DB.Model(&OrganisationUser{}).AddForeignKey("organisation_id", "organisations(id)", "RESTRICT", "RESTRICT")
}
