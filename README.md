# kavach-server

**Releasability:** [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=factly_kavach-server&metric=alert_status)](https://sonarcloud.io/dashboard?id=factly_kavach-server)  
**Reliability:** [![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=factly_kavach-server&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=factly_kavach-server) [![Bugs](https://sonarcloud.io/api/project_badges/measure?project=factly_kavach-server&metric=bugs)](https://sonarcloud.io/dashboard?id=factly_kavach-server)  
**Security:** [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=factly_kavach-server&metric=security_rating)](https://sonarcloud.io/dashboard?id=factly_kavach-server) [![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=factly_kavach-server&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=factly_kavach-server)   
**Maintainability:** [![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=factly_kavach-server&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=factly_kavach-server) [![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=factly_kavach-server&metric=sqale_index)](https://sonarcloud.io/dashboard?id=factly_kavach-server) [![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=factly_kavach-server&metric=code_smells)](https://sonarcloud.io/dashboard?id=factly_kavach-server)  
**Other:** [![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=factly_kavach-server&metric=ncloc)](https://sonarcloud.io/dashboard?id=factly_kavach-server) [![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=factly_kavach-server&metric=duplicated_lines_density)](https://sonarcloud.io/dashboard?id=factly_kavach-server) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=factly_kavach-server&metric=coverage)](https://sonarcloud.io/dashboard?id=factly_kavach-server)

### Sample Config
```yaml
postgres:
    dsn: postgres://postgres:postgres@postgres:5432/kavach?sslmode=disable
keto:
    url: http://keto:4466
mode: development
```
* config file should be stored in project root folder (eg. kavach-server.yml)
* If running in docker pass config file path in `CONFIG_FILE` env parameter at runtime.
* If running main.go then pass config file path as `-config` flag.

> If running in docker, docs can be accessed at `http://localhost:5000/swagger/index.html` 