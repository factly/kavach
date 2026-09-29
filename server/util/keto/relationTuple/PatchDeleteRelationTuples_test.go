package keto

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"sort"
	"testing"

	"github.com/spf13/viper"
)

func TestInObjectScope(t *testing.T) {
	cases := []struct {
		object, scope string
		want          bool
	}{
		{"org:1", "org:1", true},
		{"org:1:app:2", "org:1", true},
		{"roles:org:1:7", "org:1", true},
		{"resource:org:1:app:2:posts", "org:1", true},
		{"org:10", "org:1", false},
		{"org:10:app:2", "org:1", false},
		{"roles:org:10:7", "org:1", false},
		{"resource:org:10:x", "org:1", false},
		{"xorg:1", "org:1", false},
		{"org:1:app:2", "org:1:app:2", true},
		{"org:1:app:2:space:3", "org:1:app:2", true},
		{"roles:org:1:app:2:4", "org:1:app:2", true},
		{"org:1:app:20", "org:1:app:2", false},
		{"roles:org:1:app:20:4", "org:1:app:2", false},
		{"org:1:app:2:space:3", "org:1:app:2:space:3", true},
		{"org:1:app:2:space:30", "org:1:app:2:space:3", false},
	}
	for _, c := range cases {
		if got := inObjectScope(c.object, c.scope); got != c.want {
			t.Errorf("inObjectScope(%q, %q) = %v, want %v", c.object, c.scope, got, c.want)
		}
	}
}

// fakeKeto serves the given tuples one per page and records the objects of every PATCH delete.
func fakeKeto(t *testing.T, tuples []TupleWithSubjectID) (*httptest.Server, *[]string) {
	deleted := []string{}
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodGet && r.URL.Path == "/relation-tuples":
			if r.URL.Query().Get("subject_id") != "5" {
				t.Errorf("unexpected subject_id %q", r.URL.Query().Get("subject_id"))
			}
			idx := 0
			if tok := r.URL.Query().Get("page_token"); tok != "" {
				idx = int(tok[0] - 'a')
			}
			page := relationTuplesPage{Tuples: tuples[idx : idx+1]}
			if idx+1 < len(tuples) {
				page.NextPageToken = string(rune('a' + idx + 1))
			}
			_ = json.NewEncoder(w).Encode(page)
		case r.Method == http.MethodPatch && r.URL.Path == "/admin/relation-tuples":
			patches := []KetoPatchObj{}
			if err := json.NewDecoder(r.Body).Decode(&patches); err != nil {
				t.Fatal(err)
			}
			for _, p := range patches {
				if p.Action != "delete" {
					t.Errorf("unexpected action %q", p.Action)
				}
				deleted = append(deleted, p.Object)
			}
			w.WriteHeader(http.StatusNoContent)
		default:
			t.Errorf("unexpected request %s %s", r.Method, r.URL)
			w.WriteHeader(http.StatusNotFound)
		}
	}))
	viper.Set("keto_read_api_url", srv.URL)
	viper.Set("keto_write_api_url", srv.URL)
	return srv, &deleted
}

func tuplesFor(objects ...string) []TupleWithSubjectID {
	tuples := []TupleWithSubjectID{}
	for _, o := range objects {
		tuples = append(tuples, TupleWithSubjectID{SubjectSet: SubjectSet{Namespace: "organisations", Object: o, Relation: "member"}, SubjectID: "5"})
	}
	return tuples
}

func assertSameObjects(t *testing.T, got []string, want ...string) {
	t.Helper()
	sort.Strings(got)
	sort.Strings(want)
	if len(got) != len(want) {
		t.Fatalf("deleted %v, want %v", got, want)
	}
	for i := range got {
		if got[i] != want[i] {
			t.Fatalf("deleted %v, want %v", got, want)
		}
	}
}

func TestDeleteRelationTuplesOnlyTouchesTargetOrg(t *testing.T) {
	srv, deleted := fakeKeto(t, tuplesFor("org:1", "roles:org:1:3", "org:10", "roles:org:10:3", "org:100:app:1", "org:1:app:2"))
	defer srv.Close()

	if err := DeleteRelationTuplesOfSubjectIDInNamespace("organisations", "5", "org:1"); err != nil {
		t.Fatal(err)
	}
	// every page was read, so the last tuple (on page 6) is deleted too
	assertSameObjects(t, *deleted, "org:1", "roles:org:1:3", "org:1:app:2")
}

func TestDeleteRelationTuplesOnlyTouchesTargetApp(t *testing.T) {
	srv, deleted := fakeKeto(t, tuplesFor("org:1:app:2", "org:1:app:20", "roles:org:1:app:2:4", "roles:org:1:app:20:4", "org:1:app:2:space:9"))
	defer srv.Close()

	if err := DeleteRelationTuplesOfSubjectIDInNamespace("applications", "5", "org:1:app:2"); err != nil {
		t.Fatal(err)
	}
	assertSameObjects(t, *deleted, "org:1:app:2", "roles:org:1:app:2:4", "org:1:app:2:space:9")
}

func TestDeleteRelationTuplesSkipsPatchWhenNothingMatches(t *testing.T) {
	srv, deleted := fakeKeto(t, tuplesFor("org:10", "org:11"))
	defer srv.Close()

	if err := DeleteRelationTuplesOfSubjectIDInNamespace("organisations", "5", "org:1"); err != nil {
		t.Fatal(err)
	}
	assertSameObjects(t, *deleted)
}

func TestListObjectsBySubjectIDReadsAllPages(t *testing.T) {
	srv, _ := fakeKeto(t, tuplesFor("org:1", "org:2", "org:3"))
	defer srv.Close()

	objects, err := ListObjectsBySubjectID("organisations", "", "5")
	if err != nil {
		t.Fatal(err)
	}
	assertSameObjects(t, objects, "org:1", "org:2", "org:3")
}
