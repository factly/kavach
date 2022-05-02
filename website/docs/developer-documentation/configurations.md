---
sidebar_position: 5
---
# Configurations for Kavach

## Environment variables for Kavach web
- ```PUBLIC_URL``` : the public URL for kavach. Mainly used in development
- ```REACT_APP_KAVACH_TITLE``` : when set overrides the default title for kavach.
- ```REACT_APP_KAVACH_LOGO``` : when set overrides the default logo for kavach.
- ```REACT_APP_COMPANION_URL``` : the address/URL for companion i.e. s3 buckets which store images.
- ```REACT_APP_API_URL``` : the address/URL for kavach api.
- ```REACT_APP_KRATOS_PUBLIC_URL``` : the public address/URL for kratos.
- ```REACT_APP_ENABLE_MULTITENANCY``` : when true allows user to enter multiple organisations
- ```REACT_APP_DISABLE_REGISTRATION``` : when true disables the user registration
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
- ```DATABASE_USER``` : the username of the database user.
- ```DATABASE_PASSWORD``` : the password of the database user.
- ```DATABASE_SSL_MODE``` : when true, enables secure socket layers which verifies the user certificate.
- ```KETO_URL``` : the address/URL of the KETO.
- ```KRATOS_ADMIN_URL``` : the admin address/URL of the KRATOS
- ```MODE``` : mode for kavach. development/staging/production
- ```IMAGEPROXY_URL``` : the admin address/URL of the imgproxy
- ```USE_SQLITE``` : when enabled uses SQLLITE.
- ```SQLITE_DB_PATH``` : path to the sql-lite database. Required only when ```USE_SQLITE``` is ```true```.
- ```SENDGRID_API_KEY``` : valid api-key of sendgrid to send mails.
- ```DOMAIN_NAME``` : used to set the domain name of kavach.
- ```ENABLE_MULTITENANCY``` : when true allows user to enter multiple organisations
- ```DISABLE_REGISTRATION``` : when true disables the user registration
- ```SUPER_USER_EMAIL``` : the email address of super user
- Example .env file to be added in config.env in the root folder.
```
DATABASE_HOST={DATABASE-HOST} 
DATABASE_USER={DATABASE-USERNAME} 
DATABASE_PASSWORD={DATABASE-PASSWORD} 
DATABASE_NAME={DATABASE-NAME} 
DATABASE_PORT={DATABASE-PORT} 
DATABASE_SSL_MODE= disable
KETO_URL=http://keto:4466
KRATOS_ADMIN_URL=http://kratos:4434
MODE=development
IMAGEPROXY_URL=http://127.0.0.1:7001
USE_SQLITE=false
SQLITE_DB_PATH=kavach.db
SENDGRID_API_KEY={SENDGRID-API-KEY} 
DOMAIN_NAME=http://127.0.0.1:4455/.factly/kavach/web
ENABLE_MULTITENANCY=true
DISABLE_REGISTRATION=false
SUPER_USER_EMAIL=test@testorg.com
```
