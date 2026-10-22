package user

import (
	"fmt"

	"github.com/factly/kavach-server/model"
	"github.com/go-chi/chi"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type userWithPermission struct {
	model.User
	Permission model.OrganisationUser `json:"permission"`
}

const namespace string = "organisations"

var userContext model.ContextKey = "organisation_user"

// Router organisation user routes for admin
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)
	r.Post("/", create)
	r.Route("/{user_id}", func(r chi.Router) {
		r.Put("/", update)
		r.Delete("/", delete)
	})

	return r
}

// orgTuple is the keto tuple granting userID the given role in organisation orgID
func orgTuple(orgID, userID uint, role string) *model.KetoRelationTupleWithSubjectID {
	return &model.KetoRelationTupleWithSubjectID{
		KetoSubjectSet: model.KetoSubjectSet{
			Namespace: namespace,
			Object:    fmt.Sprintf("org:%d", orgID),
			Relation:  role,
		},
		SubjectID: fmt.Sprintf("%d", userID),
	}
}

// countOwnersForUpdate counts the organisation's owners and locks their rows for
// the rest of tx, so concurrent demotions or removals cannot both pass the
// last-owner check and leave the organisation without an owner.
func countOwnersForUpdate(tx *gorm.DB, orgID uint) (int, error) {
	var ids []uint
	err := tx.Model(&model.OrganisationUser{}).
		Clauses(clause.Locking{Strength: "UPDATE"}).
		Where(&model.OrganisationUser{OrganisationID: orgID, Role: "owner"}).
		Pluck("id", &ids).Error
	return len(ids), err
}
