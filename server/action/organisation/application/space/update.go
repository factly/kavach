package space

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
)

// create - Create organisation application
// @Summary Create organisation application
// @Description Create organisation application
// @Tags OrganisationApplications
// @ID add-organisation-application
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param organisation_id path string true "Organisation ID"
// @Param Application body model.SpaceRole true "Application Object"
// @Success 201 {object} model.Application
// @Failure 400 {array} string
// @Router /organisations/{organisation_id}/applications/{application_id}/spaces/{space_id} [post]
func update(w http.ResponseWriter, r *http.Request) {
	uID, err := strconv.Atoi(r.Header.Get("X-User"))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	organisationID := chi.URLParam(r, "organisation_id")
	oID, err := strconv.Atoi(organisationID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	space := &model.Space{}
	err = json.NewDecoder(r.Body).Decode(space)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(space)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	// check if the user is owner or  not
	err = util.CheckOwner(uint(uID), uint(oID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}
	// Check if record exist or not
	var count int64
	err = model.DB.Model(&model.Space{}).Where(&model.Space{
		Base: model.Base{
			ID: space.ID,
		},
	}).Count(&count).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	if count != 1 {
		loggerx.Error(errors.New("record not found"))
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	fmt.Println("this is space", space)

	// check if the id for all the mediums in space is 0 or not if it is zero then make it null
	if *space.LogoID == 0 {
		space.LogoID = nil
	}
	if *space.LogoMobileID == 0 {
		space.LogoID = nil
	}
	if *space.FavIconID == 0 {
		space.LogoID = nil
	}
	if *space.MobileIconID == 0 {
		space.LogoID = nil
	}

	updateMap := map[string]interface{}{
		"name":               space.Name,
		"slug":               space.Slug,
		"site_title":         space.SiteTitle,
		"tag_line":           space.TagLine,
		"site_address":       space.SiteAddress,
		"description":        space.Description,
		"logo_id":            space.LogoID,
		"logo_mobile_id":     space.LogoMobileID,
		"fav_icon_id":        space.FavIconID,
		"mobile_icon_id":     space.MobileIconID,
		"header_code":        space.HeaderCode,
		"footer_code":        space.FooterCode,
		"meta_fields":        space.MetaFields,
		"verification_codes": space.VerificationCodes,
		"social_media_urls":  space.SocialMediaURLs,
		"contact_info":       space.ContactInfo,
		"analytics":          space.Analytics,
	}

	err = model.DB.Model(&model.Space{}).Where("id = ?", space.ID).Updates(updateMap).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusOK, nil)
}
