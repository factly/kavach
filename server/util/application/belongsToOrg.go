package application

import "github.com/factly/kavach-server/model"

// BelongsToOrg reports whether the application is owned by the organisation
// or attached to it through application_organisations.
func BelongsToOrg(appID, orgID uint) (bool, error) {
	var count int64
	err := model.DB.Model(&model.Application{}).
		Joins("LEFT JOIN application_organisations ON application_organisations.application_id = applications.id AND application_organisations.organisation_id = ?", orgID).
		Where("applications.id = ? AND (applications.organisation_id = ? OR application_organisations.organisation_id IS NOT NULL)", appID, orgID).
		Count(&count).Error
	return count > 0, err
}
