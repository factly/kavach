package profile

import (
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

type profileResponse struct {
	model.User
	Organisations []model.Organisation `json:"organisations"`
	Applications  []model.Application  `json:"applications"`
	Spaces        []model.Space        `json:"spaces"`
}

// detail - Get logged in user details
// @Summary Get logged in user details
// @Description Get logged in user details
// @Tags Profile
// @ID get-logged-in-user
// @Produce json
// @Param X-User header string true "User ID"
// @Success 200 {object} profileResponse
// @Router /profile [get]
func detail(w http.ResponseWriter, r *http.Request) {

	userID, err := strconv.Atoi(r.Header.Get("X-User"))

	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	me := &profileResponse{}
	me.User.ID = uint(userID)

	err = model.DB.Model(&model.User{}).Preload("Medium").First(&me).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	orgUser := make([]model.OrganisationUser, 0)
	err = model.DB.Model(&model.OrganisationUser{}).Where(
		model.OrganisationUser{
			UserID: uint(userID),
		},
	).Find(&orgUser).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	for _, org := range orgUser {
		me.Organisations = append(me.Organisations, *org.Organisation)
	}

	for _, org := range me.Organisations {
		result := make([]model.Application, 0)
		model.DB.Model(&model.Application{}).Where(&model.Application{
			OrganisationID: org.ID,
		}).Preload("Users").Preload("Users.Medium").Preload("Medium").Find(&result)

		for _, app := range result {
			for _, user := range app.Users {
				if user.ID == uint(userID) {
					me.Applications = append(me.Applications, app)
				}
			}
		}

		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	for _, app := range me.Applications {
		result := make([]model.Space, 0)
		uintAppID := uint(app.ID)
		model.DB.Model(&model.Space{}).Where(&model.Space{
			ApplicationID: &uintAppID,
		}).Preload("Users").Preload("Users.Medium").Preload("Medium").Find(&result)

		for _, space := range result {
			for _, user := range space.Users {
				if user.ID == uint(userID) {
					me.Spaces = append(me.Spaces, space)
				}
			}
		}

		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	renderx.JSON(w, http.StatusOK, me)
}
