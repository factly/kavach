package organisation

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	keto "github.com/factly/kavach-server/util/keto/relationTuple"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/spf13/viper"
)

type organisation struct {
	Title            string `json:"title" validate:"required"`
	Slug             string `json:"slug"`
	Description      string `json:"description"`
	FeaturedMediumID uint   `json:"featured_medium_id"`
	IsIndividual     bool   `json:"is_individual"`
}

// create - Create organisation
// @Summary Create organisation
// @Description Create organisation
// @Tags Organisation
// @ID add-organisation
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param Organisation body organisation true "Organisation Object"
// @Success 201 {object} orgWithRole
// @Failure 400 {array} string
// @Router /organisations [post]
func create(w http.ResponseWriter, r *http.Request) {
	userID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	org := &organisation{}

	err = json.NewDecoder(r.Body).Decode(&org)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(org)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	mediumID := &org.FeaturedMediumID
	if org.FeaturedMediumID == 0 {
		mediumID = nil
	}

	tx := model.DB.WithContext(context.WithValue(r.Context(), userContext, userID)).Begin()

	if !viper.GetBool("enable_multitenancy") {
		var organisation model.Organisation
		result := tx.Model(&model.Organisation{}).First(&organisation)
		if result.RowsAffected != 0 {
			loggerx.Error(errors.New("user not authorised"))
			renderx.JSON(w, http.StatusUnauthorized, errorx.Unauthorized())
			tx.Rollback()
			return
		}
	}

	organisation := &model.Organisation{
		Title:            org.Title,
		Slug:             org.Slug,
		Description:      org.Description,
		FeaturedMediumID: mediumID,
		IsIndividual:     org.IsIndividual,
	}

	err = tx.Model(&model.Organisation{}).Create(&organisation).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Model(&model.Organisation{}).Preload("Medium").First(&organisation)

	permission := model.OrganisationUser{}
	permission.OrganisationID = uint(organisation.ID)
	permission.UserID = uint(userID)
	permission.Role = "owner"

	err = tx.Model(&model.OrganisationUser{}).Create(&permission).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	result := orgWithRole{}
	result.Organisation = *organisation
	result.Permission = permission

	// creating the organisation-role: owner, on the keto api
	tuple := &model.KetoRelationTupleWithSubjectID{
		KetoSubjectSet: model.KetoSubjectSet{
			Namespace: "organisations",
			Object:    fmt.Sprintf("org:%d", organisation.ID),
			Relation:  "owner",
		},
		SubjectID: fmt.Sprintf("%d", userID),
	}

	err = keto.CreateRelationTupleWithSubjectID(tuple)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	tx.Commit()

	renderx.JSON(w, http.StatusCreated, result)
}
