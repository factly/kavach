package model

// Policy in keto
type Policy struct {
	ID          string   `json:"id"`
	Description string   `json:"description"`
	Subjects    []string `json:"subjects"`
	Resources   []string `json:"resources"`
	Actions     []string `json:"actions"`
	Effect      string   `json:"effect"`
}

// Role in keto
type Role struct {
	ID          string   `json:"id"`
	Description string   `json:"description"`
	Members     []string `json:"members"`
}

//CheckKeto structure is used to check keto policy
type CheckKeto struct {
	Subject  string `json:"subject"`
	Action   string `json:"action"`
	Resource string `json:"resource"`
}

/*
{
  "namespace": "string",
  "object": "string",
  "relation": "string",
  "subject_id": "string"
	OR
  "subject_set": {
    "namespace": "string",
    "object": "string",
    "relation": "string"
  }
}

Only one of the subject_id and subject_set can be used at a time to creaate a relation tuple in keto.
*/
type KetoSubjectSet struct {
	Namespace string `json:"namespace"`
	Object    string `json:"object"`
	Relation  string `json:"relation"`
}

type KetoRelationTupleWithSubjectID struct {
	KetoSubjectSet
	SubjectID string `json:"subject_id"`
}

type KetoRelationTupleWithSubjectSet struct {
	KetoSubjectSet
	SubjectSet KetoSubjectSet `json:"subject_set"`
}
