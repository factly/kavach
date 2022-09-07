package user

import (
	"github.com/factly/kavach-server/model"
	keto "github.com/factly/kavach-server/util/keto/relationTuple"
)

/*
IsUserAuthorised function is used to check whether the user is part of that entity or not

namespace :- it describes the type of entity (organisation, application, space)
objectID :- it describes the id of entity on which access is checked
subjectID :- it describes the user id

RETURNS - true if the user is part of the entity otherwise returns false

*/
func IsUserAuthorised(namespace, objectID, subjectID string) (bool, error) {
	relationTuple := &model.KetoRelationTupleWithSubjectID{
		KetoSubjectSet: model.KetoSubjectSet{
			Namespace: namespace,
			Object:    objectID,
			Relation:  "owner",
		},
		SubjectID: subjectID,
	}

	isOwner, err := keto.CheckKetoRelationTupleWithSubjectID(relationTuple)
	if err != nil {
		return false, err
	}
	relationTuple.Relation = "member"
	isMember, err := keto.CheckKetoRelationTupleWithSubjectID(relationTuple)
	if err != nil {
		return false, err
	}
	return isOwner || isMember, nil
}

/*
IsActionValid is used to check whether a particular action by a user(subjectID) or a role(subjectSet) is valid or not

namespace :- it describes the type of entity (organisation, application, space)
objectID :- it describes the id of entity on which access is checked
subjectID :- it describes the user-id or role name
subjectSet :- it is the object-id for the role(subject-set)
RETURNS - true if the user is part of the entity otherwise returns false

*/
func IsActionValid(namespace, objectID, subject, relation, subjectType, subjectSet string) (bool, error) {
	var isAllowed bool
	var err error
	if subjectType == "id" {
		tuple := &model.KetoRelationTupleWithSubjectID{
			KetoSubjectSet: model.KetoSubjectSet{
				Namespace: namespace,
				Object:    objectID,
				Relation:  relation,
			},
			SubjectID: subject,
		}
		isAllowed, err = keto.CheckKetoRelationTupleWithSubjectID(tuple)
		if err != nil {
			return false, err
		}
	} else if subjectType == "set" { // if the subject_type is set then it uses CheckKetoRelationTupleWithSubjectSet function to validate the action
		tuple := &model.KetoRelationTupleWithSubjectSet{
			KetoSubjectSet: model.KetoSubjectSet{
				Namespace: namespace,
				Object:    objectID,
				Relation:  relation,
			},
			SubjectSet: model.KetoSubjectSet{
				Namespace: namespace,
				Object:    subjectSet,
				Relation:  subject,
			},
		}
		isAllowed, err = keto.CheckKetoRelationTupleWithSubjectSet(tuple)
		if err != nil {
			return false, err
		}
	}
	return isAllowed, nil
}
