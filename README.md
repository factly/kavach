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

- Create config file with name config (and extension .env, .yml, .json) in `server/` and add config variables (eg. below)
```
DATABASE_HOST=postgres 
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=kavach 
DATABASE_PORT=5432 
DATABASE_SSL_MODE=disable
KETO_URL=http://keto:4466
KRATOS_ADMIN_URL=http://kratos:4434
MODE=development
IMAGEPROXY_URL=http://127.0.0.1:7001


LOGIN_PROVIDER_PORT=:9000
LOGIN_PROVIDER_HOST=127.0.0.1
LOGIN_PROVIDER_HOST_ENDPOINT=http://127.0.0.1
LOGIN_PROVIDER_SELF_PUBLIC_API_PATH=/.ory/kratos/public/
LOGIN_PROVIDER_SESSIONS_SECRET=IM-VERY-INSECURE
```

- Create a folder companion in root `/` and create `.env` file inside companion and add config variables (eg. below)
```
COMPANION_GOOGLE_KEY=GOOGLE_KEY
COMPANION_GOOGLE_SECRET=GOOGLE_SECRET
COMPANION_AWS_ENDPOINT=http://localhost:9000
COMPANION_AWS_BUCKET=vidcheck
COMPANION_AWS_KEY=miniokey
COMPANION_AWS_SECRET=miniosecret
COMPANION_DOMAIN=localhost:3020
COMPANION_PROTOCOL=http
COMPANION_DATADIR=/
COMPANION_SELF_ENDPOINT=localhost:3020
NODE_ENV=dev
```