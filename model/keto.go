package model

// Policy in keto
type Policy struct {
	ID        string   `json:"id"`
	Subjects  []string `json:"subjects"`
	Resources []string `json:"resources"`
	Actions   []string `json:"actions"`
	Effect    string   `json:"effect"`
}

// Role in keto
type Role struct {
	ID      string   `json:"id"`
	Members []string `json:"members"`
}
