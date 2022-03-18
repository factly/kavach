package profile

import (
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

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
	var birthDate string
	if me.BirthDate != nil {
		birthDate = me.BirthDate.Format("2006-01-02")
	} else {
		birthDate = ""
	}
	response := map[string]interface{}{
		"id":                 me.ID,
		"kid":                me.KID,
		"email":              me.Email,
		"first_name":         me.FirstName,
		"last_name":          me.LastName,
		"birth_date":         birthDate,
		"slug":               me.Slug,
		"gender":             me.Gender,
		"featured_medium_id": me.FeaturedMediumID,
		"medium":             me.Medium,
		"description":        me.Description,
		"social_media_urls":  me.SocialMediaURLs,
		"display_name":       me.DisplayName,
		"meta":               me.Meta,
	}

	renderx.JSON(w, http.StatusOK, response)
}
