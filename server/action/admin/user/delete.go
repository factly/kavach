package user

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"

	"github.com/factly/kavach-server/model"
	keto "github.com/factly/kavach-server/util/keto/relationTuple"
	userUtil "github.com/factly/kavach-server/util/user"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
	"github.com/spf13/viper"
)

// delete - Soft delete user by id
// @Summary Soft delete a user
// @Description Soft delete user by ID and anonymize their data
// @Tags User
// @ID delete-user-by-id
// @Param X-User header string true "Admin User ID"
// @Param user_id path string true "User ID"
// @Success 200
// @Router /admin/users/{user_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {
	// Get user ID from path
	userID := chi.URLParam(r, "user_id")
	uID, err := strconv.Atoi(userID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	// Start a transaction
	tx := model.DB.Begin()

	// 1. Delete all user's relation tuples from Keto
	err = deleteUserRelations(uint(uID))
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	// 2. Remove user from all organizations and roles
	// First get all organizations the user is part of
	var orgUsers []model.OrganisationUser
	err = tx.Model(&model.OrganisationUser{}).Where("user_id = ?", uID).Find(&orgUsers).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// Remove user from each organization
	for _, orgUser := range orgUsers {
		err = userUtil.DeleteUserFromOrganisationRoles(orgUser.OrganisationID, uint(uID))
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}

		err = tx.Delete(&orgUser).Error
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	// 3. Soft delete user record and anonymize their data
	userToUpdate := &model.User{}
	
	// First get the user details before updating
	err = tx.Model(&model.User{}).Where("id = ?", uID).First(userToUpdate).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// Store the KID for later use
	kid := userToUpdate.KID
	
	// Anonymize user data
	anonymizedEmail := "deleted-" + userToUpdate.Email
	
	// Update user with anonymized data
	updates := map[string]interface{}{
		"display_name": "Deleted User",
		"first_name":   "Deleted User",
		"email":        anonymizedEmail,
		"is_active":    false,
	}
	
	err = tx.Model(&model.User{}).Where("id = ?", uID).Updates(updates).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	
	// Soft delete the user
	err = tx.Delete(&model.User{}, uID).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// 4. Delete user's identity from Kratos
	if kid != "" {
		err = deleteKratosIdentity(kid)
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	// Commit the transaction
	tx.Commit()

	renderx.JSON(w, http.StatusOK, nil)
}

// deleteUserRelations deletes all relation tuples for a user as part of the soft deletion process
func deleteUserRelations(userID uint) error {
	// Delete all relation tuples where the user is the subject
	tuple := &model.KetoRelationTupleWithSubjectID{
		KetoSubjectSet: model.KetoSubjectSet{},
		SubjectID:      fmt.Sprintf("%d", userID),
	}

	return keto.DeleteRelationTupleWithSubjectID(tuple)
}

// deleteKratosIdentity deletes a user's identity from Kratos as part of the soft deletion process
func deleteKratosIdentity(kid string) error {
	// Build the Kratos admin API URL
	kratosURL, err := url.Parse(viper.GetString("kratos_admin_url"))
	if err != nil {
		return err
	}
	kratosURL.Path = fmt.Sprintf("/admin/identities/%s", kid)

	// Create DELETE request
	req, err := http.NewRequest(http.MethodDelete, kratosURL.String(), nil)
	if err != nil {
		return err
	}

	// Send request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	// Check response status
	if resp.StatusCode != http.StatusNoContent {
		var respBody map[string]interface{}
		if err := json.NewDecoder(resp.Body).Decode(&respBody); err != nil {
			return fmt.Errorf("failed to decode Kratos error response: %v", err)
		}
		return fmt.Errorf("failed to delete Kratos identity: %v", respBody)
	}

	return nil
}
