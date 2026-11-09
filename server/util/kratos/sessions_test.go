package kratos

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"sort"
	"strings"
	"sync"
	"testing"

	"github.com/spf13/viper"
)

// fakeKratos answers the three calls RevokeAllSessions makes: whoami on the
// public API, the identity's live sessions and one DELETE per session on the
// admin API.
type fakeKratos struct {
	mu        sync.Mutex
	revoked   []string
	failOn    string
	whoamiErr bool
}

func (f *fakeKratos) server(t *testing.T) *httptest.Server {
	t.Helper()
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodGet && r.URL.Path == "/sessions/whoami":
			if f.whoamiErr || !strings.Contains(r.Header.Get("Cookie"), "ory_kratos_session=good") {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}
			_ = json.NewEncoder(w).Encode(map[string]interface{}{"id": "current", "identity": map[string]string{"id": "identity-1"}})
		case r.Method == http.MethodGet && r.URL.Path == "/admin/identities/identity-1/sessions":
			if r.URL.Query().Get("active") != "true" {
				t.Errorf("listed sessions without active=true: %s", r.URL.RawQuery)
			}
			_ = json.NewEncoder(w).Encode([]map[string]interface{}{
				{"id": "current", "active": true},
				{"id": "phone", "active": true},
				{"id": "laptop", "active": true},
			})
		case r.Method == http.MethodDelete && strings.HasPrefix(r.URL.Path, "/admin/sessions/"):
			id := strings.TrimPrefix(r.URL.Path, "/admin/sessions/")
			if id == f.failOn {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			f.mu.Lock()
			f.revoked = append(f.revoked, id)
			f.mu.Unlock()
			w.WriteHeader(http.StatusNoContent)
		case r.Method == http.MethodDelete && r.URL.Path == "/sessions":
			t.Error("called DELETE /sessions, which rewrites every session row the identity has")
			w.WriteHeader(http.StatusOK)
		default:
			t.Errorf("unexpected %s %s", r.Method, r.URL.Path)
			w.WriteHeader(http.StatusNotFound)
		}
	}))
	viper.Set("kratos_public_url", srv.URL)
	viper.Set("kratos_admin_url", srv.URL)
	t.Cleanup(srv.Close)
	return srv
}

func TestRevokeAllSessionsRevokesTheOtherLiveSessionsOnly(t *testing.T) {
	f := &fakeKratos{}
	f.server(t)

	if err := RevokeAllSessions("good"); err != nil {
		t.Fatal(err)
	}

	sort.Strings(f.revoked)
	if strings.Join(f.revoked, ",") != "laptop,phone" {
		t.Errorf("revoked %v, want laptop and phone and not the current session", f.revoked)
	}
}

func TestRevokeAllSessionsFailsWhenOneRevokeFails(t *testing.T) {
	f := &fakeKratos{failOn: "phone"}
	f.server(t)

	if err := RevokeAllSessions("good"); err == nil {
		t.Fatal("want an error when a session could not be revoked")
	}
	if len(f.revoked) != 1 || f.revoked[0] != "laptop" {
		t.Errorf("revoked %v, want the other session still revoked", f.revoked)
	}
}

func TestRevokeAllSessionsNeedsAValidCookie(t *testing.T) {
	f := &fakeKratos{}
	f.server(t)

	if err := RevokeAllSessions("expired"); err == nil {
		t.Fatal("want an error for a cookie Kratos does not recognise")
	}
	if len(f.revoked) != 0 {
		t.Errorf("revoked %v without a valid session", f.revoked)
	}
}
