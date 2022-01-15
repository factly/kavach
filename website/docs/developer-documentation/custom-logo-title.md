---
sidebar_position: 3
---
# Customising logo and title in Kavach
Kavach provides the ability to change logo and title on the login/registration page.  
Open docker-compose.yml in the root folder of the project and add the following environment variables in kavach-web service.

## For custom logo
```
...
  kavach-web:
    environment:
      - REACT_APP_KAVACH_LOGO={IMAGE_PATH} # Example: /src/assets/kavach.png
...
```
## For custom title
```
...
  kavach-web:
    environment:
      - REACT_APP_KAVACH_TITLE={TITLE} # Example: Kavach
...               
```