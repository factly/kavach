# Kavach

### Prerequisites
- - Install and run Docker and Docker Compose

### Setting up the ENV & Config files

- Create config file with name config (and extension .env, .yml, .json) in root folder and add config variables (see config/config.env.example for reference)
- Create a folder `companion` in root and create `.env` file inside companion and add config variables (see config/companion.env.example for reference)
- Create a `config.js` file in `web/public` (see config/web/config.js for reference)

### Starting the application

- Execute the following command docker-compose command to start Vidcheck

  ```
    docker-compose up
  ```

- When the application is started using docker-compose, a directory with name `volumes` will be created at the root directory of the project to perisit any stateful data.

### Access the application

Once the application is up and running you should be able to access the application and the relevant services using the following urls:

| Service | URL |
|--|--|
| Kavach Web | [http://127.0.0.1:4455/.factly/kavach/web/auth/login](http://127.0.0.1:4455/.factly/kavach/web/auth/login)
| Kavach Server | http://127.0.0.1:4455/.factly/kavach/server/ <br> Swagger: http://localhost:5001/swagger/index.html|
| Postgres | http://localhost:27017 <br> Username: `postgres` <br> Password: `postgres` <br>|
| Imgproxy | http://localhost:8080 |
| Companion | http://localhost:3020 |
| Minio | API: http://localhost:9000 <br> Console: http://localhost:9000 <br> Username: `miniokey` <br> Password: `miniosecret`|
| Mailslurper | Dashboard: http://localhost:4436 <br> Service: http://localhost:4437 |
| Kratos | Public API: http://localhost:4433 <br> Admin API: http://localhost:4434|
| Keto | Read: http://localhost:4466 <br> Write: http://localhost:4467 <br> Metrics: http://localhost:4468|
| Oathkeeper | Proxy: http://localhost:4455 <br>API: http://localhost:4456 <br> Rules: http://localhost:4456/rules|

### Stopping the application

- Execute the following docker-compose command to stop Kavach and all the components without removing them or their volumes. 

  ```
    docker-compose stop
  ```
- Execute the following docker-compose command to:
	-  Stop the containers and removes them
	- Delete volumes, networks, and the images used to start the containers. 
	- This completely tears down the environment and freeing up resources.

  ```
    docker-compose stop
  ```

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
- REACT_APP_ENABLE_MULTITENANCY=true/false : it is used to activate the multitenancy feature of kavach.

### For enabling OIDC
- At present kavach supports only two OIDC providers i.e. 1)Google and 2)Github
- for enabling OIDC you can add the example config at https://github.com/factly/kavach/blob/fix/permission-management/kratos/config/kratos.yml#L22
- Example configuration (only change the client_id and client_secret for each provider) : 
```
    methods:
      oidc:
        enabled: true
        config:
          providers:
            - id: github
              provider: github 
              client_id: github-client-id
              client_secret: github-client-secret
              mapper_url: file:///etc/config/kratos/oidc.github.jsonnet
              scope:
                - user:email

            - id: google 
              provider: google
              client_id: google-client-id
              client_secret: google-client-secret
              mapper_url: file:///etc/config/kratos/oidc.google.jsonnet
              scope:
                - email
                - profile
```