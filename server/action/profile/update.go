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
	FirstName        string         `json:"first_name" validate:"required"`
	LastName         string         `json:"last_name"`
	DisplayName      string         `json:"display_name" validate:"required"`
	Slug             string         `json:"slug" validate:"required"`
	BirthDate        string         `json:"birth_date"`
	Gender           string         `json:"gender"`
	FeaturedMediumID uint           `json:"featured_medium_id"`
	Description      string         `json:"description"`
	SocialMediaURLs  postgres.Jsonb `json:"social_media_urls" swaggertype:"primitive,string"`
	Meta             postgres.Jsonb `json:"meta" swaggertype:"primitive,string"`
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

	var userSlug string

	if req.Slug != me.Slug && slug.Check(req.Slug) {
		userSlug = slug.Approve(req.Slug, me.Email)
	} else {
		userSlug = req.Slug
	}

	updateUser := map[string]interface{}{
		"first_name":         req.FirstName,
		"last_name":          req.LastName,
		"slug":               userSlug,
		"gender":             req.Gender,
		"featured_medium_id": req.FeaturedMediumID,
		"description":        req.Description,
		"social_media_urls":  req.SocialMediaURLs,
		"display_name":       req.DisplayName,
		"meta":               req.Meta,
	}

	if req.BirthDate != "" {
		timeLayout := "2006-01-02"
		birth_date, err := time.Parse(timeLayout, req.BirthDate)
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.GetMessage("invalid birth_date", http.StatusUnprocessableEntity)))
			return
		}
		updateUser["birth_date"] = birth_date
	}

	if req.FeaturedMediumID == 0 {
		updateUser["featured_medium_id"] = nil
	}

	err = tx.Model(&me).Preload("Medium").Updates(&updateUser).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	tx.Commit()
	renderx.JSON(w, http.StatusOK, me)
}
