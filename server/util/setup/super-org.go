package setup

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strings"

	"github.com/factly/kavach-server/model"
	keto "github.com/factly/kavach-server/util/keto/relationTuple"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/slugx"
	"github.com/spf13/viper"
)

type kratosReq struct {
	Traits   Traits `json:"traits"`
	Password string `json:"password"`
	Method   string `json:"method"`
}

type Traits struct {
	Email string `json:"email"`
}

var dataFile = "./data/applications.json"

func checkSuperOrg() (bool, error) {
	loggerx.Info("checking whether the super organisation exists or not...")
	tuple := &model.KetoRelationTupleWithSubjectID{
		KetoSubjectSet: model.KetoSubjectSet{
			Namespace: "superorganisation",
			Object:    "org:1",
			Relation:  "superorganisation",
		},
		SubjectID: viper.GetString("application_name"),
	}
	isSuperOrg, err := keto.CheckKetoRelationTupleWithSubjectID(tuple)
	if err != nil {
		loggerx.ErrorWithoutRequest(err)
		return false, err
	}
	if !isSuperOrg {
		loggerx.Warning("super organisation does not exist")
	}
	return isSuperOrg, nil
}

func createSuperOrganisationInKeto(orgID uint) error {
	loggerx.Info("started creating super organisation in KETO")
	tuple := &model.KetoRelationTupleWithSubjectID{
		KetoSubjectSet: model.KetoSubjectSet{
			Namespace: "superorganisation",
			Object:    fmt.Sprintf("org:%d", orgID),
			Relation:  "superorganisation",
		},
		SubjectID: viper.GetString("application_name"),
	}

	err := keto.CreateRelationTupleWithSubjectID(tuple)
	if err != nil {
		loggerx.ErrorWithoutRequest(err)
		return err
	}
	loggerx.Info("super organisation in KETO created successfully")
	return nil
}

func createUserInKratos() (map[string]interface{}, error) {
	loggerx.Info("started creating user in KRATOS")
	req, err := http.NewRequest(http.MethodGet, viper.GetString("kratos_public_url")+"/self-service/registration/api", nil)
	if err != nil {
		loggerx.ErrorWithoutRequest(err)
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		loggerx.ErrorWithoutRequest(err)
		return nil, err
	}

	defer resp.Body.Close()
	var body map[string]interface{}

	err = json.NewDecoder(resp.Body).Decode(&body)
	if err != nil {
		loggerx.ErrorWithoutRequest(err)
		return nil, err
	}
	// var actionURL string
	if resp.StatusCode >= 299 {
		loggerx.ErrorWithoutRequest(errors.New("internal server error on kratos server"))
		return nil, err
	}
	ui, ok := body["ui"].(map[string]interface{})
	if !ok {
		err = errors.New("cannot create user in kratos")
		loggerx.ErrorWithoutRequest(err)
		return nil, err
	}

	actionURL, ok := ui["action"].(string)
	if !ok {
		err = errors.New("action url is not there in the kratos response. hence, cannot create user in kratos")
		loggerx.ErrorWithoutRequest(err)
		return nil, err
	}
	splittedStrings := strings.Split(actionURL, "=")
	flowID := splittedStrings[len(splittedStrings)-1]
	reqURL := viper.GetString("kratos_public_url") + "/self-service/registration?flow=%s"
	reqURL = fmt.Sprintf(reqURL, flowID)
	reqBody := kratosReq{}
	reqBody.Method = "password"
	reqBody.Password = viper.GetString("default_user_password")
	reqBody.Traits.Email = viper.GetString("default_user_email")
	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}
	sessionResp, err := http.Post(reqURL, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	respBody := map[string]interface{}{}
	err = json.NewDecoder(sessionResp.Body).Decode(&respBody)
	if err != nil {
		return nil, err
	}
	if sessionResp.StatusCode != 200 {
		if sessionResp.StatusCode == 400 {
			ui, ok := respBody["ui"].(map[string]interface{})
			if ok {
				messageObject, ok := ui["messages"].([]interface{})
				if ok {
					for _, msg := range messageObject {
						msgMap, ok := msg.(map[string]interface{})
						if ok {
							msgID := int(msgMap["id"].(float64))
							if msgID == 4000007 {
								loggerx.Warning("email already exists")
								return nil, errors.New("email already exists")
							}
						}
					}
				}
			}
		}
		loggerx.Warning("internal server error on kratos")
		return nil, errors.New("complete registration request failed")
	}
	session, ok := respBody["session"].(map[string]interface{})
	if !ok {
		loggerx.Warning("session doesn't exist in the kratos response")
		err = errors.New("session doesn't exist in kratos response")
		loggerx.ErrorWithoutRequest(err)
		return nil, err
	}

	loggerx.Info("successfull created user in KRATOS")
	return session, nil
}

func createUserInKavach(payload map[string]interface{}) (*model.User, error) {
	loggerx.Info("started creating user in KAVACH DB")
	var err error
	extra, ok := payload["extra"].(map[string]interface{}) // ok is true if extra is a map[string]interface{}
	if !ok {
		err = errors.New("extra doesn't exist in kratos payload")
		loggerx.ErrorWithoutRequest(err)
		return nil, err
	}
	identity, ok := extra["identity"].(map[string]interface{})
	if !ok {
		err = errors.New("identity doesn't exist in kratos payload")
		loggerx.ErrorWithoutRequest(err)
		return nil, err
	}

	traits, ok := identity["traits"].(map[string]interface{})
	if !ok {
		err = errors.New("traits doesn't exist in kratos payload")
		loggerx.ErrorWithoutRequest(err)
		return nil, err
	}

	emailTrait, ok := traits["email"].(string)
	if !ok {
		err = errors.New("email doesn't exist in the kratos payload")
		loggerx.ErrorWithoutRequest(err)
		return nil, err
	}

	kid, ok := identity["id"].(string)
	if !ok {
		err = errors.New("kratos id doesn't exist in the kratos payload")
		loggerx.ErrorWithoutRequest(err)
		return nil, err
	}

	user := &model.User{
		Email: emailTrait,
		KID:   kid,
	}

	// create the user
	err = model.DB.Model(&model.User{}).Create(user).Error
	if err != nil {
		loggerx.ErrorWithoutRequest(err)
		return nil, err
	}
	loggerx.Info("user successfully created in KAVACHDB")
	return user, nil
}

func createSuperOrganisation(userID uint) (*model.Organisation, error) {
	loggerx.Info("started creating super organisation in KAVACHDB")
	organisation := &model.Organisation{
		Base: model.Base{
			CreatedByID: userID,
		},
		Title: viper.GetString("default_organisation_name"),
		Slug:  slugx.Make(viper.GetString("default_organisation_name")),
	}

	model.DB.Model(&model.Organisation{}).Create(&organisation)

	permission := model.OrganisationUser{}
	permission.OrganisationID = uint(organisation.ID)
	permission.UserID = uint(userID)
	permission.Role = "owner"

	model.DB.Model(&model.OrganisationUser{}).Create(&permission)
	tuple := &model.KetoRelationTupleWithSubjectID{
		KetoSubjectSet: model.KetoSubjectSet{
			Namespace: "organisations",
			Object:    fmt.Sprintf("org:%d", organisation.ID),
			Relation:  permission.Role,
		},
		SubjectID: fmt.Sprintf("%d", userID),
	}

	err := keto.CreateRelationTupleWithSubjectID(tuple)
	if err != nil {
		loggerx.ErrorWithoutRequest(err)
		return nil, err
	}
	loggerx.Info("finished creating organisation")
	return organisation, nil
}

func createApplication(userID, orgID uint) error {
	loggerx.Info("started creating applications")
	jsonFile, err := os.Open(dataFile)
	if err != nil {
		loggerx.ErrorWithoutRequest(err)
		return err
	}

	defer jsonFile.Close()

	applications := make([]model.Application, 0)
	byteValue, _ := ioutil.ReadAll(jsonFile)
	err = json.Unmarshal(byteValue, &applications)
	if err != nil {
		loggerx.ErrorWithoutRequest(err)
		return err
	}
	for index, app := range applications {
		app.OrganisationID = orgID
		app.Base.CreatedByID = userID
		org := &model.Organisation{}
		err = model.DB.Model(&model.Organisation{}).Where(&model.Organisation{
			Base: model.Base{
				ID: orgID,
			},
		}).Find(&org).Error
		if err != nil {
			loggerx.ErrorWithoutRequest(err)
			return err
		}
		app.Organisations = append(app.Organisations, *org)
		applications[index] = app
	}

	err = model.DB.Model(&model.Application{}).Create(applications).Error
	if err != nil {
		loggerx.ErrorWithoutRequest(err)
		return err
	}

	// making the user who created application, owner of it
	for _, app := range applications {
		tuple := &model.KetoRelationTupleWithSubjectID{
			KetoSubjectSet: model.KetoSubjectSet{
				Namespace: "applications",
				Object:    fmt.Sprintf("org:%d:app:%d", orgID, app.ID),
				Relation:  "owner",
			},
			SubjectID: fmt.Sprintf("%d", userID),
		}

		err = keto.CreateRelationTupleWithSubjectID(tuple)
		if err != nil {
			loggerx.ErrorWithoutRequest(err)
			return err
		}
	}

	loggerx.Info("Applications created successfully")
	return nil
}

func CreateSuperOrg() error {
	loggerx.Init()
	model.SetupDB()
	flag, err := checkSuperOrg()
	if err != nil {
		loggerx.ErrorWithoutRequest(err)
		return err
	}
	if !flag {
		sessionMap, err := createUserInKratos()
		if err != nil {
			loggerx.ErrorWithoutRequest(err)
			return err
		}

		kavachUserCheckers := map[string]interface{}{
			"extra": sessionMap,
		}
		//create user in kavach database
		user, err := createUserInKavach(kavachUserCheckers)
		if err != nil {
			loggerx.ErrorWithoutRequest(err)
			return err
		}

		organisation, err := createSuperOrganisation(user.ID)
		if err != nil {
			return err
		}

		err = createApplication(user.ID, organisation.ID)
		if err != nil {
			return err
		}
		err = createSuperOrganisationInKeto(organisation.ID)
		if err != nil {
			return err
		}
		loggerx.Info("succesfully created super organisations with default applications")
	} else {
		loggerx.Info("Super organisation already exists")
	}

	return nil
}
