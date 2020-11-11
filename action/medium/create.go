package medium

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
)

// create - Create medium
// @Summary Create medium
// @Description Create medium
// @Tags Medium
// @ID add-medium
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param Medium body medium true "Medium Object"
// @Success 201 {object} model.Medium
// @Failure 400 {array} string
// @Router /media [post]
func create(w http.ResponseWriter, r *http.Request) {
	userID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		renderx.JSON(w, http.StatusBadRequest, nil)
		return
	}

	var media medium
	err = json.NewDecoder(r.Body).Decode(&media)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(media)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	medium := model.Medium{
		Name:        media.Name,
		Slug:        media.Slug,
		Title:       media.Title,
		Type:        media.Type,
		Description: media.Description,
		Caption:     media.Caption,
		AltText:     media.AltText,
		FileSize:    media.FileSize,
		URL:         media.URL,
		Dimensions:  media.Dimensions,
		UserID:      uint(userID),
	}

	err = model.DB.Model(&model.Medium{}).Create(&medium).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusCreated, medium)
}
