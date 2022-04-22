package util

import (
	"errors"

	"github.com/factly/kavach-server/model"
)

func GetOrganisationPolicyByID(policyID uint) (*string, error) {
	// getting the organisation policy  name using policyID
	policyMap := make(map[string]interface{})
	err := model.DB.Model(&model.OrganisationPolicy{}).Where(&model.OrganisationPolicy{
		Base: model.Base{
			ID: policyID,
		},
	},
	).Pluck("name", &policyMap).Error

	if err != nil {
		return nil, err
	}

	policy , ok := policyMap["name"].(string)
	if !ok {
		return nil, errors.New("no name for the policy  present")
	}
	return &policy , nil
}

func GetApplicationPolicyByID(policyID uint) (*string, error) {
	// getting the application policy  name using policyID
	policyMap := make(map[string]interface{})
	err := model.DB.Model(&model.ApplicationPolicy{}).Where(&model.ApplicationPolicy{
		Base: model.Base{
			ID: policyID,
		},
	},
	).Pluck("name", &policyMap).Error

	if err != nil {
		return nil, err
	}

	policy , ok := policyMap["name"].(string)
	if !ok {
		return nil, errors.New("no name for the policy  present")
	}
	return &policy , nil
}

func GetSpacePolicyByID(policyID uint) (*string, error) {
	// getting the space policy  name using policyID
	policyMap := make(map[string]interface{})
	err := model.DB.Model(&model.SpacePolicy{}).Where(&model.SpacePolicy{
		Base: model.Base{
			ID: policyID,
		},
	},
	).Pluck("name", &policyMap).Error

	if err != nil {
		return nil, err
	}

	policy , ok := policyMap["name"].(string)
	if !ok {
		return nil, errors.New("no name for the policy  present")
	}
	return &policy , nil
}
