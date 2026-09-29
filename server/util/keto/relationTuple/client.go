package keto

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"time"

	"github.com/factly/x/loggerx"
	"github.com/spf13/viper"
)

// httpClient is shared by every Keto helper so that a stalled Keto cannot hang a request forever.
var httpClient = &http.Client{Timeout: 10 * time.Second}

// maxRelationTuplePages bounds the pagination loop in case Keto keeps returning a page token.
const maxRelationTuplePages = 1000

type relationTuplesPage struct {
	Tuples        []TupleWithSubjectID `json:"relation_tuples"`
	NextPageToken string               `json:"next_page_token"`
}

// listRelationTuples reads every page of GET /relation-tuples for the given query.
func listRelationTuples(params url.Values) ([]TupleWithSubjectID, error) {
	baseURL, err := url.Parse(viper.GetString("keto_read_api_url"))
	if err != nil {
		return nil, err
	}
	baseURL.Path += "relation-tuples"

	tuples := []TupleWithSubjectID{}
	pageToken := ""
	for i := 0; i < maxRelationTuplePages; i++ {
		query := url.Values{}
		for k, v := range params {
			query[k] = v
		}
		if pageToken != "" {
			query.Set("page_token", pageToken)
		}
		baseURL.RawQuery = query.Encode()

		page, err := getRelationTuplesPage(baseURL.String())
		if err != nil {
			return nil, err
		}
		tuples = append(tuples, page.Tuples...)
		if page.NextPageToken == "" || page.NextPageToken == pageToken {
			return tuples, nil
		}
		pageToken = page.NextPageToken
	}
	return nil, errors.New("too many pages of relation tuples")
}

func getRelationTuplesPage(pageURL string) (*relationTuplesPage, error) {
	req, err := http.NewRequest(http.MethodGet, pageURL, nil)
	if err != nil {
		return nil, err
	}
	response, err := httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		loggerx.Error(errors.New("keto returned status " + response.Status + " for " + pageURL))
		return nil, errors.New("error in listing the relation tuples")
	}
	page := &relationTuplesPage{}
	if err := json.NewDecoder(response.Body).Decode(page); err != nil {
		return nil, err
	}
	return page, nil
}
