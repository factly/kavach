package kratos

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/factly/x/loggerx"
	"github.com/spf13/viper"
)

// Kratos Errors
var (
	ErrGettingKratosSessions  = errors.New("error in getting active sessions from kratos_admin_url")
	ErrDecodingKratosResponse = errors.New("error in decoding kratos response")

	ErrRevokingSession = errors.New("error in revoking session")
)

// GetActiveSessionByKratosID gets all the sessions which are active
func GetActiveSessionByKratosID(kratosID string) ([]interface{}, error) {
	response, err := http.Get(viper.GetString("kratos_admin_url") + "/admin/identities/" + kratosID + "/sessions?active=true")
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()
	if response.StatusCode != 200 {
		loggerx.Error(ErrGettingKratosSessions)
		return nil, ErrGettingKratosSessions
	}
	var responseBody []interface{}
	err = json.NewDecoder(response.Body).Decode(&responseBody)
	if err != nil {
		loggerx.Error(err)
		return nil, ErrGettingKratosSessions
	}

	activeSessions := []interface{}{}
	for _, session := range responseBody {
		sessionJsonObj, isJson := session.(map[string]interface{})
		if !isJson {
			loggerx.Error(ErrDecodingKratosResponse)
			return nil, ErrDecodingKratosResponse
		}

		if sessionJsonObj["active"].(bool) {
			activeSessions = append(activeSessions, sessionJsonObj)
		}
	}

	return activeSessions, nil
}

// RevokeSessionByID revokes a particular session by session ID
func RevokeSessionByID(sessionID, orySessionCookie string) error {
	req, err := http.NewRequest(http.MethodDelete, fmt.Sprint(viper.GetString("kratos_public_url")+"/sessions/"+sessionID), nil)
	if err != nil {
		loggerx.Error(err)
		return err
	}

	req.Header.Add("Cookie", fmt.Sprint("ory_kratos_session=", orySessionCookie))

	response, err := http.DefaultClient.Do(req)
	if err != nil {
		loggerx.Error(err)
		return err
	}
	defer response.Body.Close()
	if response.StatusCode != 204 {
		loggerx.Error(ErrRevokingSession)
		return ErrRevokingSession
	}

	return nil
}

// RevokeAllSessions revokes all the sessions except the session whose cookie is used to send delete request to kratos admin
func RevokeAllSessions(orySessionCookie string) error {
	reqURL := viper.GetString("kratos_public_url") + "/sessions"
	req, err := http.NewRequest(http.MethodDelete, reqURL, nil)
	if err != nil {
		loggerx.Error(err)
		return err
	}

	req.Header.Add("Cookie", fmt.Sprint("ory_kratos_session=", orySessionCookie))
	response, err := http.DefaultClient.Do(req)
	if err != nil {
		loggerx.Error(err)
		return err
	}
	defer response.Body.Close()
	if response.StatusCode != 200 {
		loggerx.Error(ErrRevokingSession)
		return ErrRevokingSession
	}

	return nil
}
