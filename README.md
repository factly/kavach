## Setting up Development environment for Dega

###Pre-requisites

- Currently we are only supporting development on Mac OS and Linux
- Install and run Docker

###Clone the required repositories
Create a new directory called dega and clone the following repositories into the directory:

- [dega-gateway](https://github.com/factly/dega-gateway)
- [dega-core](https://github.com/factly/dega-core)
- [dega-factcheck](https://github.com/factly/dega-factcheck)

### Using Docker to simplify development

- Unzip the [volumes](https://www.dropbox.com/s/ht5xw1ekwoaku4f/volumes.zip?dl=0) directory into the root folder
- Navigate to dega-gateway and execute the following command to bring up MongoDB, Elasticsearch, Keycloak, Postgres (used by Keycloak)
  Consul:
  `docker-compose -f src/main/docker/app-dev.yml up`
- To stop and remove the containers, run:

  docker-compose -f src/main/docker/app-dev.yml down

### Starting Gateway

This application is configured for Service Discovery and Configuration with Consul. On launch, it will refuse to start if it is not able to connect to Consul at [http://localhost:8500](http://localhost:8500)

Navigate to dega-gateway and perform the following steps to start Gateway:

- Install all the node modules `npm install`

Bring up dega-gateway using the command: ./gradlew

### Startup Core and Factcheck (optional)

Navigate to dega-core and start the application in the dev profile by running:

```
./gradlew
```

Navigate to dega-factcheck and start the application in the dev profile by running:

```
./gradlew
```

Bring up dega-factcheck using the command: ./gradlew

## Development

To start your application in the dev profile, simply run:

    ./gradlew

### Using angular-cli

You can also use [Angular CLI][] to generate some custom client code.

For example, the following command:

    ng generate component my-component

will generate few files:

    create src/main/webapp/app/my-component/my-component.component.html
    create src/main/webapp/app/my-component/my-component.component.ts
    update src/main/webapp/app/app.module.ts

## Building for production

To optimize the gateway application for production, run:

    ./gradlew -Pprod clean bootWar

To ensure everything worked, run:

    java -jar build/libs/*.war

## Testing

To launch your application's tests, run:

    ./gradlew test

### Other tests

Performance tests are run by Gatling and written in Scala. They're located in [src/test/gatling](src/test/gatling).

To use those tests, you must install Gatling from [https://gatling.io/](https://gatling.io/).

### Code quality

Sonar is used to analyse code quality. You can start a local Sonar server (accessible on http://localhost:9001) with:

```
docker-compose -f src/main/docker/sonar.yml up -d
```

Then, run a Sonar analysis:

```
./gradlew -Pprod clean test sonarqube
```
