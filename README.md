# Kavach

### Starting the application

- Execute the following command docker-compose command to start Vidcheck

  ```
    docker-compose up
  ```

- When the application is started using docker-compose, a directory with name `factly` will be created at the root level to perisit all the data

### Access the application

Once the application is up and running you should be able to access it using the following urls:

- Vidcheck: [http://127.0.0.1:4455/.factly/vid-check/web/](http://127.0.0.1:4455/.factly/vid-check/web/)
- Kavach: [http://127.0.0.1:4455/.factly/kavach/web/auth/login](http://127.0.0.1:4455/.factly/kavach/web/auth/login)

### Stopping the application

- Execute the following command docker-compose command to stop Vidcheck and all the components

  ```
    docker-compose down
  ```

### Env files to be added

- Create config file with name config (and extension .env, .yml, .json) in root folder and add config variables (see config.env.example for reference)
- Create a folder `companion` in root and create `.env` file inside companion and add config variables (see .env.example for reference)

### Setting up the email server

- Create a mailgun account.
- On the dashboard click on one of the sending domains.
- Select the SMTP method for sending the email.
- In kratos config file, add the smtp connection URI. Format of the URI is smtp://username:password@smtp.mailgun.org:port/?skip_ssl_verify=true
- Example : smtp://postmaster@sandboxsomerandomusername123.mailgun.org:somerandompassword123@smtp.mailgun.org:587/?skip_ssl_verify=true


### Environment variables - Kavach-web

- PUBLIC_URL=http://127.0.0.1:4455/.factly/kavach/web : used for customising URL for kavach-web
- REACT_APP_KAVACH_TITLE=Kavach : helps in customising the title on the login screen.
- REACT_APP_LOGO_URL={some_image_url} : helps in customising the logo on the login screen. 
- REACT_APP_KRATOS_PUBLIC_URL=http://127.0.0.1:4455/.ory/kratos/public : used for customising the public URL in kratos-config i.e. the common part for all the self-service endpoints.
- REACT_APP_COMPANION_URL=http://127.0.0.1:3020 : used for the location of third party storage
- REACT_APP_API_URL=http://127.0.0.1:4455/.factly/kavach/server : used for customising server endpoint for kavach-web.
