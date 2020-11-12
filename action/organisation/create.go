package organisation

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/keto"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
)

type organisation struct {
	Title            string `json:"title" validate:"required"`
	Slug             string `json:"slug"`
	Description      string `json:"description"`
	FeaturedMediumID uint   `json:"featured_medium_id"`
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

	organisation := &model.Organisation{
		Title:            org.Title,
		Slug:             org.Slug,
		Description:      org.Description,
		FeaturedMediumID: mediumID,
	}

	tx := model.DB.Begin()

	err = tx.Model(&model.Organisation{}).Create(&organisation).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Model(&model.Organisation{}).Preload("Medium").First(&organisation)

	permission := model.OrganisationUser{}
	permission.OrganisationID = organisation.ID
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

	/* creating role of admins */
	reqRole := &model.Role{}
	reqRole.ID = "roles:org:" + fmt.Sprint(organisation.ID) + ":admin"
	reqRole.Members = []string{fmt.Sprint(userID)}

	err = keto.UpdateRole("/engines/acp/ory/regex/roles", reqRole)

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.NetworkError()))
		return
	}

	/* creating policy for admins */
	reqPolicy := &model.Policy{}
	reqPolicy.ID = "org:" + fmt.Sprint(organisation.ID) + ":admins"
	reqPolicy.Subjects = []string{reqRole.ID}
	reqPolicy.Resources = []string{"resources:org:" + fmt.Sprint(organisation.ID) + ":<.*>"}
	reqPolicy.Actions = []string{"actions:org:" + fmt.Sprint(organisation.ID) + ":<.*>"}
	reqPolicy.Effect = "allow"

	err = keto.UpdatePolicy("/engines/acp/ory/regex/policies", reqPolicy)

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.NetworkError()))
		return
	}

	tx.Commit()

	renderx.JSON(w, http.StatusCreated, result)
}
