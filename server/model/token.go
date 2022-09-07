package model

type ValidationBody struct {
	Token string `json:"token" validate:"required"`
}
