package profile

import (
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

type orgWithRole struct {
	model.Organisation
	Permission model.OrganisationUser `json:"permission"`
}
type profileDetailsResponse struct {
	model.User
	Organisations []orgWithRole       `json:"organisations"`
	Applications  []model.Application `json:"applications"`
	Spaces        []model.Space       `json:"spaces"`
}

// detail - Get logged in user details
// @Summary Get logged in user details
// @Description Get logged in user details
// @Tags Profile
// @ID get-logged-in-user
// @Produce json
// @Param X-User header string true "User ID"
// @Success 200 {object} model.User
// @Router /profile [get]
func detail(w http.ResponseWriter, r *http.Request) {

	userID, err := strconv.Atoi(r.Header.Get("X-User"))

	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	me := &model.User{}
	me.ID = uint(userID)

	err = model.DB.Model(&model.User{}).Preload("Medium").First(&me).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	renderx.JSON(w, http.StatusOK, me)
}

// profileDetail - Get logged in user details including organisations, applications and spaces
// @Summary Get logged in user details including organisations, applications and spaces
// @Description Get logged in user details including organisations, applications and spaces
// @Tags Profile
// @ID get-logged-in-user-details
// @Produce json
// @Param X-User header string true "User ID"
// @Success 200 {object} profileDetailsResponse
// @Router /profile/details [get]
func profileDetail(w http.ResponseWriter, r *http.Request) {

	userID, err := strconv.Atoi(r.Header.Get("X-User"))

	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	me := &profileDetailsResponse{}
	me.User.ID = uint(userID)

	err = model.DB.Model(&model.User{}).Preload("Medium").First(&me.User).Error
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
	).Preload("Organisation").Find(&orgUser).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	for _, org := range orgUser {
		me.Organisations = append(me.Organisations, orgWithRole{
			Organisation: *org.Organisation,
			Permission:   org,
		})
	}

	for _, org := range me.Organisations {
		org.Permission.Organisation = nil
	}
	
	for _, org := range me.Organisations {
		result := make([]model.Application, 0)
		err = model.DB.Model(&model.Application{}).Where(&model.Application{
			OrganisationID: org.ID,
		}).Preload("Users").Preload("Users.Medium").Preload("Medium").Find(&result).Error

		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}

		for _, app := range result {
			for _, user := range app.Users {
				if user.ID == uint(userID) {
					me.Applications = append(me.Applications, app)
				}
			}
		}
	}

	for _, app := range me.Applications {
		result := make([]model.Space, 0)
		uintAppID := uint(app.ID)
		model.DB.Model(&model.Space{}).Where(&model.Space{
			ApplicationID: &uintAppID,
		}).Preload("Application").Preload("Logo").Preload("LogoMobile").Preload("FavIcon").Preload("MobileIcon").Preload("Users").Find(&result)

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
