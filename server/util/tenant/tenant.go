// Package tenant keeps objects addressed by ID inside the organisation,
// application and space named in the request URL.
package tenant

import (
	"net/http"
	"strconv"

	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/application"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/go-chi/chi"
)

// RequireApplication renders 404 unless the application_id URL param names an
// application owned by or attached to the organisation_id URL param.
func RequireApplication(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ids, ok := urlIDs(w, r, "application_id", "organisation_id")
		if !ok {
			return
		}
		found, err := application.BelongsToOrg(ids[0], ids[1])
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
		if !found {
			errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
			return
		}
		next.ServeHTTP(w, r)
	})
}

// RequireChild returns middleware that renders 404 unless the row of m whose id
// is the idParam URL param has every parent column equal to the URL param of
// the same name (e.g. "organisation_id"). Handlers behind it may then act on
// the row by id alone.
func RequireChild(m interface{}, idParam string, parents ...string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ids, ok := urlIDs(w, r, append([]string{idParam}, parents...)...)
			if !ok {
				return
			}
			q := model.DB.Model(m).Where("id = ?", ids[0])
			for i, column := range parents {
				q = q.Where(column+" = ?", ids[i+1])
			}
			var count int64
			if err := q.Count(&count).Error; err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.DBError()))
				return
			}
			if count == 0 {
				errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// AllBelong reports whether every id names a row of m matching conds, e.g. that
// role IDs sent in a request body all belong to the organisation in the URL.
func AllBelong(m interface{}, ids []uint, conds map[string]interface{}) (bool, error) {
	seen := make(map[uint]bool, len(ids))
	unique := make([]uint, 0, len(ids))
	for _, id := range ids {
		if !seen[id] {
			seen[id] = true
			unique = append(unique, id)
		}
	}
	if len(unique) == 0 {
		return true, nil
	}
	var count int64
	err := model.DB.Model(m).Where("id IN ?", unique).Where(conds).Count(&count).Error
	return count == int64(len(unique)), err
}

func urlIDs(w http.ResponseWriter, r *http.Request, params ...string) ([]uint, bool) {
	ids := make([]uint, len(params))
	for i, p := range params {
		id, err := strconv.ParseUint(chi.URLParam(r, p), 10, 32)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InvalidID()))
			return nil, false
		}
		ids[i] = uint(id)
	}
	return ids, true
}
