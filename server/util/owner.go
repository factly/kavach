package util

import (
	"errors"
	"fmt"

	"github.com/factly/kavach-server/model"
	keto "github.com/factly/kavach-server/util/keto/relationTuple"
)

// CheckOwner checks if the given user is owner of organization
func CheckOwner(uid uint, oid uint) error {
	tuple := &model.KetoRelationTupleWithSubjectID{
		KetoSubjectSet: model.KetoSubjectSet{
			Namespace: "organisations",
			Object:    fmt.Sprintf("org:%d", oid),
			Relation:  "owner",
		},
		SubjectID: fmt.Sprintf("%d", uid),
	}
	isAllowed, err := keto.CheckKetoRelationTupleWithSubjectID(tuple)
	if err != nil {
		return err
	}
	if !isAllowed {
		return errors.New("user is not an owner")
	}
	return nil
}
