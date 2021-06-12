# Kavach Server

**Releasability:** [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=factly_kavach-server&metric=alert_status)](https://sonarcloud.io/dashboard?id=factly_kavach-server)  
**Reliability:** [![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=factly_kavach-server&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=factly_kavach-server) [![Bugs](https://sonarcloud.io/api/project_badges/measure?project=factly_kavach-server&metric=bugs)](https://sonarcloud.io/dashboard?id=factly_kavach-server)  
**Security:** [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=factly_kavach-server&metric=security_rating)](https://sonarcloud.io/dashboard?id=factly_kavach-server) [![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=factly_kavach-server&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=factly_kavach-server)  
**Maintainability:** [![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=factly_kavach-server&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=factly_kavach-server) [![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=factly_kavach-server&metric=sqale_index)](https://sonarcloud.io/dashboard?id=factly_kavach-server) [![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=factly_kavach-server&metric=code_smells)](https://sonarcloud.io/dashboard?id=factly_kavach-server)  
**Other:** [![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=factly_kavach-server&metric=ncloc)](https://sonarcloud.io/dashboard?id=factly_kavach-server) [![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=factly_kavach-server&metric=duplicated_lines_density)](https://sonarcloud.io/dashboard?id=factly_kavach-server) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=factly_kavach-server&metric=coverage)](https://sonarcloud.io/dashboard?id=factly_kavach-server)

### Configurable variables

```sh
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
```

-   Config file should be stored in project root folder with name config (ext can be yml, json, env)
-   Environment variables can also be set for configuration.

> If running in docker, swagger docs can be accessed at `http://localhost:5000/swagger/index.html`
