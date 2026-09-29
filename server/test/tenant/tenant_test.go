package tenant

import (
	"database/sql/driver"
	"net/http"
	"net/http/httptest"
	"regexp"
	"strings"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/action/organisation"
	"github.com/factly/kavach-server/model"
	"github.com/factly/kavach-server/util/tenant"
	"github.com/factly/kavach-server/util/test"
	"github.com/factly/x/loggerx"
	"github.com/go-chi/chi"
)

const (
	appCountQuery   = `SELECT count(*) FROM "applications" LEFT JOIN application_organisations ON application_organisations.application_id = applications.id AND application_organisations.organisation_id = $1 WHERE (applications.id = $2 AND (applications.organisation_id = $3 OR application_organisations.organisation_id IS NOT NULL))`
	spaceCountQuery = `SELECT count(*) FROM "spaces" WHERE id = $1 AND organisation_id = $2 AND application_id = $3`
)

func count(n int) *sqlmock.Rows {
	return sqlmock.NewRows([]string{"count"}).AddRow(n)
}

func expectCount(mock sqlmock.Sqlmock, query string, n int, args ...interface{}) {
	values := make([]driver.Value, len(args))
	for i, a := range args {
		values[i] = a
	}
	mock.ExpectQuery(regexp.QuoteMeta(query)).WithArgs(values...).WillReturnRows(count(n))
}

func newRouter() chi.Router {
	r := chi.NewRouter()
	r.Use(loggerx.Init())
	return r
}

func serve(method, path string) *httptest.ResponseRecorder {
	r := newRouter()
	r.Mount("/organisations", organisation.Router())
	w := httptest.NewRecorder()
	r.ServeHTTP(w, httptest.NewRequest(method, path, strings.NewReader("{}")))
	return w
}

// Every route that addresses a child object by id must 404 when that id
// belongs to another tenant, before the handler runs.
func TestChildRoutesRejectOtherTenantsIDs(t *testing.T) {
	type parent struct {
		query string
		args  []interface{}
	}
	app := parent{appCountQuery, []interface{}{1, 2, 1}}
	space := parent{spaceCountQuery, []interface{}{3, 1, 2}}

	cases := []struct {
		name    string
		method  string
		path    string
		parents []parent
		child   string
		args    []interface{}
	}{
		{"org policy details", "GET", "/organisations/1/policy/9/", nil, `SELECT count(*) FROM "organisation_policies" WHERE id = $1 AND organisation_id = $2`, []interface{}{9, 1}},
		{"org policy update", "PUT", "/organisations/1/policy/9/", nil, `SELECT count(*) FROM "organisation_policies" WHERE id = $1 AND organisation_id = $2`, []interface{}{9, 1}},
		{"org policy delete", "DELETE", "/organisations/1/policy/9/", nil, `SELECT count(*) FROM "organisation_policies" WHERE id = $1 AND organisation_id = $2`, []interface{}{9, 1}},
		{"org role delete", "DELETE", "/organisations/1/roles/9/", nil, `SELECT count(*) FROM "organisation_roles" WHERE id = $1 AND organisation_id = $2`, []interface{}{9, 1}},
		{"org role users", "POST", "/organisations/1/roles/9/users/", nil, `SELECT count(*) FROM "organisation_roles" WHERE id = $1 AND organisation_id = $2`, []interface{}{9, 1}},
		{"org token delete", "DELETE", "/organisations/1/tokens/9", nil, `SELECT count(*) FROM "organisation_tokens" WHERE id = $1 AND organisation_id = $2`, []interface{}{9, 1}},

		{"app details", "GET", "/organisations/1/applications/2/", nil, appCountQuery, []interface{}{1, 2, 1}},
		{"app user create", "POST", "/organisations/1/applications/2/users/", nil, appCountQuery, []interface{}{1, 2, 1}},
		{"app token create", "POST", "/organisations/1/applications/2/tokens/", nil, appCountQuery, []interface{}{1, 2, 1}},
		{"app space create", "POST", "/organisations/1/applications/2/spaces/", nil, appCountQuery, []interface{}{1, 2, 1}},
		{"app policy delete", "DELETE", "/organisations/1/applications/2/policy/9/", []parent{app}, `SELECT count(*) FROM "application_policies" WHERE id = $1 AND organisation_id = $2 AND application_id = $3`, []interface{}{9, 1, 2}},
		{"app role delete", "DELETE", "/organisations/1/applications/2/roles/9/", []parent{app}, `SELECT count(*) FROM "application_roles" WHERE id = $1 AND organisation_id = $2 AND application_id = $3`, []interface{}{9, 1, 2}},
		{"app token delete", "DELETE", "/organisations/1/applications/2/tokens/9", []parent{app}, `SELECT count(*) FROM "application_tokens" WHERE id = $1 AND organisation_id = $2 AND application_id = $3`, []interface{}{9, 1, 2}},

		{"space update", "PUT", "/organisations/1/applications/2/spaces/3/", []parent{app}, spaceCountQuery, []interface{}{3, 1, 2}},
		{"space token create", "POST", "/organisations/1/applications/2/spaces/3/tokens/", []parent{app}, spaceCountQuery, []interface{}{3, 1, 2}},
		{"space policy delete", "DELETE", "/organisations/1/applications/2/spaces/3/policy/9/", []parent{app, space}, `SELECT count(*) FROM "space_policies" WHERE id = $1 AND space_id = $2`, []interface{}{9, 3}},
		{"space role delete", "DELETE", "/organisations/1/applications/2/spaces/3/roles/9/", []parent{app, space}, `SELECT count(*) FROM "space_roles" WHERE id = $1 AND space_id = $2`, []interface{}{9, 3}},
		{"space token delete", "DELETE", "/organisations/1/applications/2/spaces/3/tokens/9", []parent{app, space}, `SELECT count(*) FROM "space_tokens" WHERE id = $1 AND space_id = $2`, []interface{}{9, 3}},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			mock := test.SetupMockDB()
			for _, p := range tc.parents {
				expectCount(mock, p.query, 1, p.args...)
			}
			expectCount(mock, tc.child, 0, tc.args...)

			w := serve(tc.method, tc.path)
			if w.Code != http.StatusNotFound {
				t.Errorf("status = %d, want 404; body %s", w.Code, w.Body.String())
			}
			test.ExpectationsMet(t, mock)
		})
	}
}

func TestRequireChildPassesOwnObject(t *testing.T) {
	mock := test.SetupMockDB()
	expectCount(mock, `SELECT count(*) FROM "space_tokens" WHERE id = $1 AND space_id = $2`, 1, 9, 3)

	reached := false
	r := newRouter()
	r.With(tenant.RequireChild(&model.SpaceToken{}, "token_id", "space_id")).
		Get("/{space_id}/{token_id}", func(w http.ResponseWriter, r *http.Request) { reached = true })
	r.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest("GET", "/3/9", nil))

	if !reached {
		t.Error("handler was not reached for an object inside its parent")
	}
	test.ExpectationsMet(t, mock)
}

func TestRequireChildRejectsInvalidID(t *testing.T) {
	test.SetupMockDB()
	r := newRouter()
	r.With(tenant.RequireChild(&model.SpaceToken{}, "token_id", "space_id")).
		Get("/{space_id}/{token_id}", func(w http.ResponseWriter, r *http.Request) {})
	w := httptest.NewRecorder()
	r.ServeHTTP(w, httptest.NewRequest("GET", "/3/abc", nil))
	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want 400", w.Code)
	}
}

func TestAllBelong(t *testing.T) {
	mock := test.SetupMockDB()
	query := `SELECT count(*) FROM "organisation_roles" WHERE id IN ($1,$2) AND "organisation_id" = $3`

	expectCount(mock, query, 1, 4, 5, 1)
	ok, err := tenant.AllBelong(&model.OrganisationRole{}, []uint{4, 5, 4}, map[string]interface{}{"organisation_id": 1})
	if err != nil || ok {
		t.Errorf("AllBelong = %v, %v; want false when one role is another tenant's", ok, err)
	}

	expectCount(mock, query, 2, 4, 5, 1)
	ok, err = tenant.AllBelong(&model.OrganisationRole{}, []uint{4, 5}, map[string]interface{}{"organisation_id": 1})
	if err != nil || !ok {
		t.Errorf("AllBelong = %v, %v; want true", ok, err)
	}

	ok, err = tenant.AllBelong(&model.OrganisationRole{}, nil, map[string]interface{}{"organisation_id": 1})
	if err != nil || !ok {
		t.Errorf("AllBelong(nil) = %v, %v; want true", ok, err)
	}
	test.ExpectationsMet(t, mock)
}
