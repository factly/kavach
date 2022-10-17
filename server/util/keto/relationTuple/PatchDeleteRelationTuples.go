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

func DeleteRelationTuplesOfSubjectIDInNamespace(namespace, subjectID string, objectPrefix string) error {
	//BUILDING THE URL TO SEND THE GET REQUEST TO /relation-tuples ENDPOINT TO KETO API

	baseURL, err := url.Parse(viper.GetString("keto_read_api_url"))
	if err != nil {
		return err
	}
	// adding the path for the URL
	baseURL.Path += "relation-tuples"

	// adding the query parameters for the request
	params := url.Values{}
	if namespace != "" {
		params.Add("namespace", namespace)
	}
	if subjectID == "" {
		return errors.New("subjectID is a required field")
	} else {
		params.Add("subject_id", subjectID)
	}

	baseURL.RawQuery = params.Encode()

	// sending the get request to /relation-tuples
	req, err := http.NewRequest(http.MethodGet, baseURL.String(), nil)
	if err != nil {
		return err
	}

	client := &http.Client{}
	response, err := client.Do(req)
	if err != nil {
		return err
	}
	tuples := RelationTuplesWithSubjectID{}
	err = json.NewDecoder(response.Body).Decode(&tuples)

	if err != nil {
		return err
	}
	if response.StatusCode != 200 {
		return errors.New("error in expanding the relation tuple")
	}
	if objectPrefix == "" {
		tuplePatchObj, err := makeKetoTuplePatchObj(&tuples, "delete")
		if err != nil {
			return err
		}
		err = makeKetoPatchRequest(tuplePatchObj)
		if err != nil {
			return err
		}
	} else {
		filteredTuples := filter(tuples.Tuples, objectPrefix, hasSubtring)
		tuples := RelationTuplesWithSubjectID{
			Tuples: filteredTuples,
		}
		tuplePatchObj, err := makeKetoTuplePatchObj(&tuples, "delete")
		if err != nil {
			return err
		}
		err = makeKetoPatchRequest(tuplePatchObj)
		if err != nil {
			return err
		}

	}
	return nil

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

	client := &http.Client{}
	response, err := client.Do(req)
	if err != nil {
		return err
	}

	if response.StatusCode == 400 || response.StatusCode == 404 || response.StatusCode == 500 {
		responseBody := make(map[string]interface{})
		err = json.NewDecoder(response.Body).Decode(&responseBody)
		if err != nil {
			return err
		}
		loggerx.Error(errors.New(responseBody["message"].(string)))
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

func hasSubtring(Object string, Substring string) bool {
	return strings.Contains(Object, Substring)
}
