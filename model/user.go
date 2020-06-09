package model

// User model definition
type User struct {
	Base
	Email     string `gorm:"column:email;unique_index" json:"email"`
	KID       string `gorm:"column:kid;" json:"kid"`
	FirstName string `gorm:"column:first_name" json:"first_name"`
	LastName  string `gorm:"column:last_name" json:"last_name"`
	BirthDate string `gorm:"column:birth_date" json:"birth_date"`
	Gender    string `gorm:"column:gender" json:"gender"`
}
