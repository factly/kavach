---
sidebar_position: 2
---
# Configuring an Email Server

Configuring an email servercan be useful to send Emails when you have activated the link method. For learning more about link method visit [kratos-docs](https://www.ory.sh/kratos/docs/). For configuring Email server open kratos/config/kratos.yml 

### For SendGrid
- Create a sendgrid account.
- On the dashboard click on one of the sending domains.
- Select the SMTP method for sending the email.
- In kratos config file, add the smtp connection URI. Format of the URI is [smtp://username:password@smtp.sendgrid.net:port/?skip_ssl_verify=true](https://sendgrid.net)
- Example :  
```
courier:
  from_name: Kavach Develop
  from_address: kavach-develop@factly.in  
  smtp:
    smtps://apikey:YOUR-API-KEY@smtp.sendgrid.net:465/?skip_ssl_verify=false
```

### For MailGun
- Create a mailgun account.
- On the dashboard click on one of the sending domains.
- Select the SMTP method for sending the email.
- In kratos config file, add the smtp connection URI. Format of the URI is [smtp://username:password@smtp.mailgun.org:port/?skip_ssl_verify=true](https://mailgun.org)
- Example :  
```
courier:
  from_address: kavach-develop@factly.in  
  smtp:
    smtp://postmaster@sandboxsomerandomusername123.mailgun.org:somerandompassword123@smtp.mailgun.org:587/?skip_ssl_verify=true
```
 


