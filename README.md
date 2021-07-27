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