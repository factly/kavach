package medium

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// delete - Delete medium by id
// @Summary Delete a medium
// @Description Delete medium by ID
// @Tags Medium
// @ID delete-medium-by-id
// @Param X-User header string true "User ID"
// @Param medium_id path string true "Medium ID"
// @Success 200
// @Router /media/{medium_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {
	userID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		renderx.JSON(w, http.StatusBadRequest, nil)
		return
	}

	mediumID := chi.URLParam(r, "medium_id")
	id, err := strconv.Atoi(mediumID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	result := &model.Medium{}
	result.ID = uint(id)

	// check record exists or not
	err = model.DB.Where(&model.Medium{
		UserID: uint(userID),
	}).First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	uintID := uint(id)

	// check if medium is associated with user
	var totAssociated int64
	model.DB.Model(&model.User{}).Where(&model.User{
		FeaturedMediumID: &uintID,
	}).Count(&totAssociated)

	if totAssociated != 0 {
		loggerx.Error(errors.New("medium is associated with user"))
		errorx.Render(w, errorx.Parser(errorx.CannotSaveChanges()))
		return
	}

	// check if medium is associated with organisation
	model.DB.Model(&model.Organisation{}).Where(&model.Organisation{
		FeaturedMediumID: &uintID,
	}).Count(&totAssociated)

	if totAssociated != 0 {
		loggerx.Error(errors.New("medium is associated with organisation"))
		errorx.Render(w, errorx.Parser(errorx.CannotSaveChanges()))
		return
	}

	model.DB.Delete(&result)
	renderx.JSON(w, http.StatusOK, nil)
}
