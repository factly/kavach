package email

import (
	"bytes"
	"fmt"
	"html/template"
	"log"
	"github.com/spf13/viper"
	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)

type MailReceiver struct {
	InviteeName      string
	InviteeEmail     string
	ActionURL        string
	OrganisationName string
	Role             string
}

func SendmailwithSendGrid(data MailReceiver) error {
	from := mail.NewEmail("Kavach Develop", "kavach-develop@factly.in")
	subject := fmt.Sprintf("Inviting to %s", data.OrganisationName)
	to := mail.NewEmail(data.InviteeName, data.InviteeEmail)
	var body *template.Template
	var err error
	body, err = template.ParseFiles("/app/util/email/template.html")
	if err != nil {
		return err
	}
	buf := new(bytes.Buffer)
	if err = body.Execute(buf, data); err != nil {
		log.Println(err)
		return err
	}
	htmlContent := buf.String()
	message := mail.NewSingleEmail(from, subject, to, "", htmlContent)
	client := sendgrid.NewSendClient(viper.GetString("sendgrid_api_key"))
	_, err = client.Send(message)
	if err != nil {
		log.Println(err)
		return err
	}
	return nil
}
