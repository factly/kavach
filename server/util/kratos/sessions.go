package kratos

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"sync"

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

// RevokeAllSessions revokes every live session of the cookie's identity except
// the one the cookie belongs to.
//
// It does not call Kratos's DELETE /sessions for this. That endpoint runs
// UPDATE sessions SET active = false WHERE identity_id = ? AND id != ?, which
// rewrites every session row the identity has ever had, expired ones included:
// over a thousand rows for the heaviest users, read from disk and written back
// with all six indexes. In production it averaged ~5 s and reached 17 s. The
// live sessions are the only ones that need revoking, and there are a handful,
// so they are listed and revoked one by one by primary key.
func RevokeAllSessions(orySessionCookie string) error {
	current, identityID, err := currentSession(orySessionCookie)
	if err != nil {
		log.Println("[RevokeAllSessions] reading the current session:", err)
		return ErrRevokingSession
	}

	active, err := GetActiveSessionByKratosID(identityID)
	if err != nil {
		return err
	}

	var (
		wg     sync.WaitGroup
		mu     sync.Mutex
		failed int
	)
	for _, s := range active {
		session, ok := s.(map[string]interface{})
		if !ok {
			return ErrDecodingKratosResponse
		}
		id, _ := session["id"].(string)
		if id == "" || id == current {
			continue
		}
		wg.Add(1)
		go func(id string) {
			defer wg.Done()
			if err := revokeSessionAsAdmin(id); err != nil {
				log.Println("[RevokeAllSessions]", err)
				mu.Lock()
				failed++
				mu.Unlock()
			}
		}(id)
	}
	wg.Wait()

	if failed > 0 {
		log.Printf("[RevokeAllSessions] %d of %d sessions were not revoked", failed, len(active))
		return ErrRevokingSession
	}
	return nil
}

// currentSession reads the cookie's session and identity from Kratos.
func currentSession(orySessionCookie string) (sessionID, identityID string, err error) {
	req, err := http.NewRequest(http.MethodGet, viper.GetString("kratos_public_url")+"/sessions/whoami", nil)
	if err != nil {
		return "", "", err
	}
	req.Header.Add("Cookie", fmt.Sprint("ory_kratos_session=", orySessionCookie))

	response, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", "", err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return "", "", fmt.Errorf("whoami answered %d", response.StatusCode)
	}

	var session struct {
		ID       string `json:"id"`
		Identity struct {
			ID string `json:"id"`
		} `json:"identity"`
	}
	if err := json.NewDecoder(response.Body).Decode(&session); err != nil {
		return "", "", err
	}
	if session.ID == "" || session.Identity.ID == "" {
		return "", "", errors.New("whoami returned no session or identity id")
	}
	return session.ID, session.Identity.ID, nil
}

// revokeSessionAsAdmin revokes one session by ID through the admin API, which
// is UPDATE sessions SET active = false WHERE id = ? AND nid = ?.
func revokeSessionAsAdmin(sessionID string) error {
	req, err := http.NewRequest(http.MethodDelete, viper.GetString("kratos_admin_url")+"/admin/sessions/"+sessionID, nil)
	if err != nil {
		return err
	}
	response, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusNoContent {
		body, _ := io.ReadAll(response.Body)
		return fmt.Errorf("revoking session %s: Kratos answered %d: %s", sessionID, response.StatusCode, body)
	}
	return nil
}
