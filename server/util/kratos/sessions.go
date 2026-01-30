package kratos

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
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
		var errMap map[string]interface{}
		err = json.NewDecoder(response.Body).Decode(&errMap)
		if err != nil {
			loggerx.Error(err)
			return nil, ErrGettingKratosSessions
		}
		loggerx.Warning(fmt.Sprintln("response status code = ", response.StatusCode, errMap))
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
	reqURL := fmt.Sprint(viper.GetString("kratos_public_url") + "/sessions/" + sessionID)
	log.Println("[RevokeSessionByID] Request URL:", reqURL)

	req, err := http.NewRequest(http.MethodDelete, reqURL, nil)
	if err != nil {
		log.Println("[RevokeSessionByID] Error creating request:", err)
		loggerx.Error(err)
		return err
	}

	req.Header.Add("Cookie", fmt.Sprint("ory_kratos_session=", orySessionCookie))
	log.Println("[RevokeSessionByID] Request headers:", req.Header)

	response, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Println("[RevokeSessionByID] Error executing request:", err)
		loggerx.Error(err)
		return err
	}
	defer response.Body.Close()

	log.Println("[RevokeSessionByID] Response status code:", response.StatusCode)
	log.Println("[RevokeSessionByID] Response headers:", response.Header)

	if response.StatusCode != 204 {
		body, _ := io.ReadAll(response.Body)
		log.Println("[RevokeSessionByID] Response body:", string(body))
		loggerx.Error(ErrRevokingSession)
		return ErrRevokingSession
	}

	log.Println("[RevokeSessionByID] Session revoked successfully")
	return nil
}

// RevokeAllSessions revokes all the sessions except the session whose cookie is used to send delete request to kratos admin
func RevokeAllSessions(orySessionCookie string) error {
	reqURL := viper.GetString("kratos_public_url") + "/sessions"
	log.Println("[RevokeAllSessions] Request URL:", reqURL)

	req, err := http.NewRequest(http.MethodDelete, reqURL, nil)
	if err != nil {
		log.Println("[RevokeAllSessions] Error creating request:", err)
		loggerx.Error(err)
		return err
	}

	req.Header.Add("Cookie", fmt.Sprint("ory_kratos_session=", orySessionCookie))
	log.Println("[RevokeAllSessions] Request headers:", req.Header)

	response, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Println("[RevokeAllSessions] Error executing request:", err)
		loggerx.Error(err)
		return err
	}
	defer response.Body.Close()

	log.Println("[RevokeAllSessions] Response status code:", response.StatusCode)
	log.Println("[RevokeAllSessions] Response headers:", response.Header)

	if response.StatusCode != 200 {
		body, _ := io.ReadAll(response.Body)
		log.Println("[RevokeAllSessions] Response body:", string(body))
		loggerx.Error(ErrRevokingSession)
		return ErrRevokingSession
	}

	log.Println("[RevokeAllSessions] All sessions revoked successfully")
	return nil
}
