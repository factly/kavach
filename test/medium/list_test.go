package medium

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/kavach-server/action"
	"github.com/factly/kavach-server/util/test"
	"github.com/gavv/httpexpect"
)

func TestMediumList(t *testing.T) {
	mock := test.SetupMockDB()

	router := action.RegisterRoutes()
	server := httptest.NewServer(router)
	defer server.Close()

	// create httpexpect instance
	e := httpexpect.New(t, server.URL)

	t.Run("invalid user id header", func(t *testing.T) {
		e.GET(basePath).
			WithHeader("X-User", "invalid").
			Expect().
			Status(http.StatusBadRequest)
	})

	t.Run("get empty list of media", func(t *testing.T) {
		countQuery(mock, 0)

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(columns))

		e.GET(basePath).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": 0})
		test.ExpectationsMet(t, mock)
	})

	t.Run("get list of media", func(t *testing.T) {
		countQuery(mock, len(mediumList))

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(columns).
				AddRow(1, time.Now(), time.Now(), nil, 1, 1, mediumList[0]["name"], mediumList[0]["slug"], mediumList[0]["type"], mediumList[0]["title"], mediumList[0]["description"], mediumList[0]["caption"], mediumList[0]["alt_text"], mediumList[0]["file_size"], mediumList[0]["url"], mediumList[0]["dimensions"], 1).
				AddRow(2, time.Now(), time.Now(), nil, 1, 1, mediumList[1]["name"], mediumList[1]["slug"], mediumList[1]["type"], mediumList[1]["title"], mediumList[1]["description"], mediumList[1]["caption"], mediumList[1]["alt_text"], mediumList[1]["file_size"], mediumList[1]["url"], mediumList[1]["dimensions"], 1))

		e.GET(basePath).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": len(mediumList)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(mediumList[0])

		test.ExpectationsMet(t, mock)
	})

	t.Run("get list of media with paiganation", func(t *testing.T) {
		countQuery(mock, len(mediumList))

		mock.ExpectQuery(selectQuery).
			WillReturnRows(sqlmock.NewRows(columns).
				AddRow(2, time.Now(), time.Now(), nil, 1, 1, mediumList[1]["name"], mediumList[1]["slug"], mediumList[1]["type"], mediumList[1]["title"], mediumList[1]["description"], mediumList[1]["caption"], mediumList[1]["alt_text"], mediumList[1]["file_size"], mediumList[1]["url"], mediumList[1]["dimensions"], 1))

		e.GET(basePath).
			WithHeader("X-User", "1").
			WithQueryObject(map[string]interface{}{
				"limit": "1",
				"page":  "2",
			}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": len(mediumList)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			ContainsMap(mediumList[1])

		test.ExpectationsMet(t, mock)
	})
}
