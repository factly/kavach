package profile

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/slug"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/jinzhu/gorm/dialects/postgres"
)

type user struct {
	FirstName        string         `json:"first_name"`
	LastName         string         `json:"last_name"`
	DisplayName      string         `json:"display_name"`
	Slug             string         `json:"slug"`
	BirthDate        string      `json:"birth_date"`
	Gender           string         `json:"gender"`
	FeaturedMediumID uint           `json:"featured_medium_id"`
	Description      string         `json:"description"`
	SocialMediaURLs  postgres.Jsonb `json:"social_media_urls" swaggertype:"primitive,string"`
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

	var userSlug string

	if req.Slug != "" && req.Slug != me.Slug && slug.Check(req.Slug) {
		userSlug = slug.Approve(req.Slug, me.Email)
	} else {
		userSlug = req.Slug
	}
	birthDate, err := time.Parse("2006-01-02", req.BirthDate)
	if err!=nil{
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}
	updateUser := model.User{
		FirstName:        req.FirstName,
		LastName:         req.LastName,
		BirthDate:        birthDate,
		Slug:             userSlug,
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
