---
sidebar_position: 5
---
# Configurations for Kavach

## Environment variables for Kavach web
- ```PUBLIC_URL``` : the public URL for kavach. Mainly used in development
- ```REACT_APP_KAVACH_TITLE``` : when set overrides the default title for kavach.
- ```REACT_APP_LOGO_URL``` : when set overrides the default logo for kavach.
- ```REACT_APP_COMPANION_URL``` : the address/URL for companion i.e. s3 buckets which store images.
- ```REACT_APP_API_URL``` : the address/URL for kavach api.
- ```REACT_APP_KRATOS_PUBLIC_URL``` : the public address/URL for kratos.
- ```REACT_APP_ENABLE_MULTITENANCY``` : when true allows user to enter multiple organisations
- ```REACT_APP_DISABLE_REGISTRATION``` : when true disables the user registration
- ```REACT_APP_REDIRECT_SINGLE_APPLICATION_USERS```: when true if you have only one application, it will redirect you to that application.
- ```REACT_APP_ENABLE_IMGPROXY```: when true it uses proxy URL for image instead of raw URL.

- Example env variables for Kavach-web. Add this env variables in kavach-web docker-service in docker-compose.yml.

```
PUBLIC_URL=http://127.0.0.1:4455/.factly/kavach/web
REACT_APP_KAVACH_TITLE=Kavach
REACT_APP_COMPANION_URL=http://127.0.0.1:3020
REACT_APP_API_URL=http://127.0.0.1:4455/.factly/kavach/server
REACT_APP_KRATOS_PUBLIC_URL=http://127.0.0.1:4455/.ory/kratos/public
REACT_APP_ENABLE_MULTITENANCY=true
REACT_APP_DISABLE_REGISTRATION=false
```
## Environment variables for Kavach server
- ```DATABASE_HOST``` : the address/URL of the database
- ```DATABASE_USER``` : the username of the database user
- ```DATABASE_PASSWORD``` : the password of the database user
- ```DATABASE_NAME```: the name of the database
- ```DATABASE_SSL_MODE``` : when true, enables secure socket layers which verifies the user certificate
- ```KETO_WRITE_API_URL``` : the address/URL of the keto-write API
- ```KETO_READ_API_URL```: the address/URL of the keto-read API
- ```KRATOS_ADMIN_URL```: the admin address/URL of the kratos service
- ```KRATOS_PUBLIC_URL```: the public address/URL of the kratos service
- ```MODE``` : environment for kavach. development/staging/production
- ```IMAGEPROXY_URL``` : the admin address/URL of the imgproxy
- ```USE_SQLITE``` : when enabled uses SQLITE. If USE_SQLITE is true environment vars with prefix **DATABASE** are not needed.
- ```SQLITE_DB_PATH``` : path to the db file. 
- ```SENDGRID_API_KEY``` : valid api-key of sendgrid to send mails.
- ```DOMAIN_NAME``` : used to set the domain name of kavach.
- ```ENABLE_MULTITENANCY``` : when true allows user to enter multiple organisations
- ```DYNAMIC_EMAIL_ENABLED```: it is a boolean value which controls whether a dynamic welcome email will be sent to the user or not. It also needs other environment variable to be set which are - `DYNAMIC_FROM_EMAIL`, `MANDE_HOST`, `DYNAMIC_MANDE_TEMPLATE_ID` and `DYNAMIC_SENDGRID_API_KEY`.
- ```DYNAMIC_FROM_EMAIL```: the application name from which this dynamic email is coming.
- ```MANDE_HOST```: host of a mande application
- ```DYNAMIC_MANDE_TEMPLATE_ID```: the template id to send the email
- ```DYNAMIC_SENDGRID_API_KEY```: sendgrid API key to send the mail
- ```DISABLE_REGISTRATION``` : when true disables the user registration
- ```DEFAULT_USER_EMAIL``` : the email address of the default user. The default user will also be a super user
- ```DEFAULT_USER_PASSWORD```: the password of the default user. 
- ```DEFAULT_ORGANISATION_NAME```: name of the default organisation which will be created. It will also be the super organisation.
- ```APPLICATION_NAME```: name of the application. Default application name is Kavach. If you want that add APPLICATION_NAME=Kavach, but if you want to override it set APPLICATION_NAME to the application name you want.
-```BUCKET_NAME```: name of the s3 bucket where you are storing BLOB data.
- Example .env file to be added in config.env in the root folder.
```
DATABASE_HOST=postgres 
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=kavach 
DATABASE_PORT=5432 
DATABASE_SSL_MODE=disable
KETO_WRITE_API_URL=http://keto:4467
KETO_READ_API_URL=http://keto:4466
KRATOS_ADMIN_URL=http://kratos:4434
KRATOS_PUBLIC_URL=http://kratos:4433
MODE=development
IMAGEPROXY_URL=http://127.0.0.1:7001
USE_SQLITE=true
SQLITE_DB_PATH=kavach.db
SENDGRID_API_KEY=API-KEY
DOMAIN_NAME=http://127.0.0.1:4455/.factly/kavach/web 
DYNAMIC_EMAIL_ENABLED=true
DYNAMIC_FROM_EMAIL='kavach'
MANDE_HOST=http://mande.factly.in
DYNAMIC_MANDE_TEMPLATE_ID=1
DYNAMIC_SENDGRID_API_KEY=API-KEY
ENABLE_MULTITENANCY=true
DISABLE_REGISTRATION=false
SUPER_USER_EMAIL=kavach-develop@factly.in
APPLICATION_NAME=Kavach
DEFAULT_USER_EMAIL=kavach-factly@factly.in
DEFAULT_USER_PASSWORD=Data123@#
DEFAULT_ORGANISATION_NAME=FACTLYADMIN
BUCKET_NAME=login.factly.in
```
