package keto

import (
	"errors"
	"net/url"
)

// ListObjectsBySubjectID function is used to list all the objects that user(subject) has access to by sending request to "/relation-tuples" endpoint in keto
// for more information - https://www.ory.sh/docs/keto/guides/list-api-display-objects
func ListObjectsBySubjectID(namespace, relation, subjectID string) ([]string, error) {
	if subjectID == "" {
		return nil, errors.New("subjectID is a required field")
	}
	params := url.Values{}
	if namespace != "" {
		params.Add("namespace", namespace)
	}
	if relation != "" {
		params.Add("relation", relation)
	}
	params.Add("subject_id", subjectID)

	tuples, err := listRelationTuples(params)
	if err != nil {
		return nil, err
	}
	accessibleObjects := make([]string, 0, len(tuples))
	for _, tuple := range tuples {
		accessibleObjects = append(accessibleObjects, tuple.Object)
	}
	return accessibleObjects, nil
}
