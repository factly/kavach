package profile

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/jinzhu/gorm/dialects/postgres"
)

type user struct {
	FirstName        string         `json:"first_name"`
	LastName         string         `json:"last_name"`
	DisplayName      string         `json:"display_name"`
	BirthDate        string         `json:"birth_date"`
	Gender           string         `json:"gender"`
	FeaturedMediumID uint           `json:"featured_medium_id"`
	Description      string         `json:"description"`
	SocialMediaURLs  postgres.Jsonb `json:"social_media_urls"`
}

// update - Update user info
// @Summary Update user info
// @Description Update user info
// @Tags Profile
// @ID update-logged-in-user
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param User body user false "User"
// @Success 200 {object} model.User
// @Router /profile [put]
func update(w http.ResponseWriter, r *http.Request) {

	req := user{}
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	userID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	me := &model.User{}
	me.ID = uint(userID)

	err = model.DB.First(&me).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}
	tx := model.DB.Begin()

	mediumID := &req.FeaturedMediumID
	me.FeaturedMediumID = &req.FeaturedMediumID
	if req.FeaturedMediumID == 0 {
		err = tx.Model(&me).Updates(map[string]interface{}{"featured_medium_id": nil}).First(&me).Error
		mediumID = nil
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	updateUser := model.User{
		FirstName:        req.FirstName,
		LastName:         req.LastName,
		BirthDate:        req.BirthDate,
		Gender:           req.Gender,
		FeaturedMediumID: mediumID,
		Description:      req.Description,
		SocialMediaURLs:  req.SocialMediaURLs,
		DisplayName:      req.DisplayName,
	}
	updateUser.ID = me.ID

	err = tx.Model(&me).Updates(&updateUser).Preload("Medium").First(&me).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Commit()
	renderx.JSON(w, http.StatusOK, me)
}
