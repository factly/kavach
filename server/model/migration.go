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

	// Backfill: users deleted before anonymization was keyed on the row ID were
	// stored as "deleted-<email>", which collides when a re-registered email is
	// deleted again. Rewrite those to "deleted-<id>-<email>". Rows already in
	// that form are skipped, so it is safe to run on every migrate.
	err := DB.Exec(`UPDATE users SET email = 'deleted-' || id || '-' || substr(email, 9)
		WHERE deleted_at IS NOT NULL AND email LIKE 'deleted-%' AND email NOT LIKE 'deleted-' || id || '-%'`).Error
	if err != nil {
		loggerx.Error(err)
	}
}
