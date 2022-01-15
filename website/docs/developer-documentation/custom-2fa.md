---
sidebar_position: 4
---
# Customising attributes of Two Factor Authentication
Open **./kratos/config.yml** and add the following:
## For custom issuer name
```
...
  methods:
    totp:
      enabled: true
      config:
        issuer: factly.in  #Issuer Name 
...
```
## For changing visibility of account name:
```
...
{
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    traits: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          title: 'Your E-Mail',
          minLength: 3,
          'ory.sh/kratos': {
            credentials: {
              // ...
             totp: {
               account_name: true //You can set it false to hide the account_name
             }
            }
            // ...
          }
        }
        // ...
      }
      // ...
    }
  }
}
...
```