package setup

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
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

func checkSuperOrg() (bool, error) {
	log.Println("checking whether the super organisation exists or not...")
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
		loggerx.Error(err)
		return false, err
	}
	if !isSuperOrg {
		log.Println("super organisation does not exist")
	}
	return isSuperOrg, nil
}

func createSuperOrganisationInKeto(orgID uint) error {
	log.Println("started creating super organisation in KETO")
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
		loggerx.Error(err)
		return err
	}
	log.Println("super organisation in KETO created successfully")
	return nil
}

func createUserInKratos() (map[string]interface{}, error) {
	log.Println("started creating user in KRATOS")
	req, err := http.NewRequest(http.MethodGet, viper.GetString("kratos_public_url")+"/self-service/registration/api", nil)
	if err != nil {
		loggerx.Error(err)
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		loggerx.Error(err)
		return nil, err
	}

	defer resp.Body.Close()
	var body map[string]interface{}

	err = json.NewDecoder(resp.Body).Decode(&body)
	if err != nil {
		loggerx.Error(err)
		return nil, err
	}
	// var actionURL string
	if resp.StatusCode >= 299 {
		loggerx.Error(errors.New("internal server error on kratos server"))
		return nil, err
	}
	ui, ok := body["ui"].(map[string]interface{})
	if !ok {
		err = errors.New("cannot create user in kratos")
		loggerx.Error(err)
		return nil, err
	}

	actionURL, ok := ui["action"].(string)
	if !ok {
		err = errors.New("action url is not there in the kratos response. hence, cannot create user in kratos")
		loggerx.Error(err)
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
	log.Println("response status code", sessionResp.StatusCode);
	log.Println("this is response body", respBody);
	if sessionResp.StatusCode != 200 {
		if sessionResp.StatusCode == 400 {
			ui := respBody["ui"].(map[string]interface{})
			log.Println(ui["messages"].(map[string]interface{}))
		} else {
			log.Println("internal server error on kratos")
		}
		return nil, errors.New("complete registration request failed")
	}
	session, ok := respBody["session"].(map[string]interface{})
	if !ok {
		log.Println("session doesn't exist in the kratos response")
		err = errors.New("session doesn't exist in kratos response")
		loggerx.Error(err)
		return nil, err
	}

	log.Println("successfull created user in KRATOS")
	return session, nil
}

func createUserInKavach(payload map[string]interface{}) (*model.User, error) {
	log.Println("started creating user in KAVACH DB")
	var err error
	extra, ok := payload["extra"].(map[string]interface{}) // ok is true if extra is a map[string]interface{}
	if !ok {
		err = errors.New("extra doesn't exist in kratos payload")
		loggerx.Error(err)
		return nil, err
	}
	identity, ok := extra["identity"].(map[string]interface{})
	if !ok {
		err = errors.New("identity doesn't exist in kratos payload")
		loggerx.Error(err)
		return nil, err
	}

	traits, ok := identity["traits"].(map[string]interface{})
	if !ok {
		err = errors.New("traits doesn't exist in kratos payload")
		loggerx.Error(err)
		return nil, err
	}

	emailTrait, ok := traits["email"].(string)
	if !ok {
		err = errors.New("email doesn't exist in the kratos payload")
		loggerx.Error(err)
		return nil, err
	}

	kid, ok := identity["id"].(string)
	if !ok {
		err = errors.New("kratos id doesn't exist in the kratos payload")
		loggerx.Error(err)
		return nil, err
	}

	user := &model.User{
		Email: emailTrait,
		KID:   kid,
	}

	// create the user
	err = model.DB.Model(&model.User{}).Create(user).Error
	if err != nil {
		loggerx.Error(err)
		return nil, err
	}
	log.Println("user successfully created in KAVACHDB")
	return user, nil
}

func createSuperOrganisation(userID uint) (*model.Organisation, error) {
	log.Println("started creating super organisation in KAVACHDB")
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
		loggerx.Error(err)
		return nil, err
	}
	log.Println("finished creating organisation")
	return organisation, nil
}

func createApplication(userID, orgID uint) error {
	log.Println("started creating applications")
	dataFile := "/app/util/setup/applications.json"
	jsonFile, err := os.Open(dataFile)
	if err != nil {
		loggerx.Error(err)
		return err
	}

	defer jsonFile.Close()

	applications := make([]model.Application, 0)
	byteValue, _ := ioutil.ReadAll(jsonFile)
	err = json.Unmarshal(byteValue, &applications)
	if err != nil {
		loggerx.Error(err)
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
			loggerx.Error(err)
			return err
		}
		app.Organisations = append(app.Organisations, *org)
		applications[index] = app
	}

	err = model.DB.Model(&model.Application{}).Create(applications).Error
	if err != nil {
		log.Println(err)
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
			loggerx.Error(err)
			return err
		}
	}

	log.Println("Applications created successfully")
	return nil
}

func CreateSuperOrg() error {
	model.SetupDB()
	flag, err := checkSuperOrg()
	if err != nil {
		log.Println("unable to create super organisation")
		loggerx.Error(err)
		return err
	}
	if !flag {
		sessionMap, err := createUserInKratos()
		if err != nil {
			loggerx.Error(err)
			return err
		}

		kavachUserCheckers := map[string]interface{}{
			"extra": sessionMap,
		}
		//create user in kavach database
		user, err := createUserInKavach(kavachUserCheckers)
		if err != nil {
			loggerx.Error(err)
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
		log.Println("succesfully created super organisations with default applications")
	} else {
		log.Println("Super organisation already exists")
	}

	return nil
}
