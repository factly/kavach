---
sidebar_position: 2
---

# Installation

## Using Docker Compose 
Docker is the easiest way to get started with Kavach on your system locally

### Pre-requisites
- Currently the setup is only tested for development on Linux and Mac OS
- Install and run [Docker](https://docs.docker.com/engine/install/) and [Docker-Compose](https://docs.docker.com/engine/install/).

### Clone the required repository
- **[Kavach](https://github.com/factly/kavach)**
```
 git pull https://github.com/factly/kavach.git
```

### Env files to be added
- Create config file with name config (and extension .env, .yml, .json) in server/ and add config variables (eg. below)
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
USE_SQLITE=true
SQLITE_DB_PATH=kavach.db
```
- Create a folder companion in root / and create .env file inside companion and add config variables (eg. below)
```
COMPANION_GOOGLE_KEY=<GOOGLE KEY>
COMPANION_GOOGLE_SECRET=<GOOGLE SECRET>
COMPANION_AWS_ENDPOINT=http://localhost:9000
COMPANION_AWS_BUCKET=dega
COMPANION_AWS_KEY=miniokey
COMPANION_AWS_SECRET=miniosecret
COMPANION_DOMAIN=localhost:3020
COMPANION_PROTOCOL=http
COMPANION_DATADIR=/
COMPANION_SELF_ENDPOINT=localhost:3020
NODE_ENV=dev
```

### Starting the application
- Execute the following command docker-compose command to start Kavach
```
docker-compose up
```
- When the application is started using docker-compose, a directory with name ```factly``` will be created at the root level to persist all the data