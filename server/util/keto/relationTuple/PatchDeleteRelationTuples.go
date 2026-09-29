package keto

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"strings"

	"github.com/factly/x/loggerx"
	"github.com/spf13/viper"
)

type RelationTuplesWithSubjectID struct {
	Tuples []TupleWithSubjectID `json:"relation_tuples"`
}

type TupleWithSubjectID struct {
	SubjectSet
	SubjectID string `json:"subject_id"`
}
type SubjectSet struct {
	Namespace string `json:"namespace"`
	Object    string `json:"object"`
	Relation  string `json:"relation"`
}
type KetoPatchObj struct {
	Action             string `json:"action"`
	TupleWithSubjectID `json:"relation_tuple"`
}
type KetoPatchObjList struct {
	PatchTuples []KetoPatchObj
}

// DeleteRelationTuplesOfSubjectIDInNamespace deletes every tuple of subjectID in namespace whose object lies inside objectScope
// (e.g. "org:5" or "org:5:app:2"). An empty objectScope deletes all of the subject's tuples in the namespace.
func DeleteRelationTuplesOfSubjectIDInNamespace(namespace, subjectID string, objectScope string) error {
	if subjectID == "" {
		return errors.New("subjectID is a required field")
	}
	params := url.Values{}
	if namespace != "" {
		params.Add("namespace", namespace)
	}
	params.Add("subject_id", subjectID)

	tuples, err := listRelationTuples(params)
	if err != nil {
		return err
	}
	if objectScope != "" {
		tuples = filter(tuples, objectScope, inObjectScope)
	}
	if len(tuples) == 0 {
		return nil
	}
	tuplePatchObj, err := makeKetoTuplePatchObj(&RelationTuplesWithSubjectID{Tuples: tuples}, "delete")
	if err != nil {
		return err
	}
	return makeKetoPatchRequest(tuplePatchObj)
}

func makeKetoTuplePatchObj(RelationTuples *RelationTuplesWithSubjectID, action string) (*[]KetoPatchObj, error) {
	patchList := make([]KetoPatchObj, 0)
	for _, tuple := range RelationTuples.Tuples {
		patch := KetoPatchObj{}
		patch.Action = action
		patch.Namespace = tuple.Namespace
		patch.Object = tuple.Object
		patch.Relation = tuple.Relation
		patch.SubjectID = tuple.SubjectID
		patchList = append(patchList, patch)
	}
	return &patchList, nil

}

func makeKetoPatchRequest(patchList *[]KetoPatchObj) error {
	buf := new(bytes.Buffer)
	err := json.NewEncoder(buf).Encode(patchList)
	if err != nil {
		return err
	}
	baseURL, err := url.Parse(viper.GetString("keto_write_api_url"))
	if err != nil {
		return err
	}
	baseURL.Path += "admin/relation-tuples"
	req, err := http.NewRequest(http.MethodPatch, baseURL.String(), buf)
	if err != nil {
		return err
	}

	response, err := httpClient.Do(req)
	if err != nil {
		return err
	}
	defer response.Body.Close()

	if response.StatusCode < 200 || response.StatusCode >= 300 {
		loggerx.Error(errors.New("keto returned status " + response.Status + " for relation tuple patch"))
		return errors.New("error in deleting the relation tuple")
	}
	return nil

}

func filter(tuples []TupleWithSubjectID, prefix string, test func(string, string) bool) (ret []TupleWithSubjectID) {
	for _, tuple := range tuples {
		if test(tuple.Object, prefix) {
			ret = append(ret, tuple)
		}
	}
	return
}

// objectTypePrefixes are the object kinds that embed an org/app/space path, e.g. "roles:org:5:3".
var objectTypePrefixes = []string{"", "roles:", "resource:"}

// inObjectScope reports whether object is scope itself or nested under it, matching whole ":"-separated
// segments so that "org:5" does not match "org:50" and "org:5:app:2" does not match "org:5:app:23".
func inObjectScope(object string, scope string) bool {
	for _, typePrefix := range objectTypePrefixes {
		prefixed := typePrefix + scope
		if object == prefixed || strings.HasPrefix(object, prefixed+":") {
			return true
		}
	}
	return false
}
