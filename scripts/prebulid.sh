ROOT_CONFIG_ENV=config/config.env
COMPANION_ENV=config/companion/.env
WEB_CONFIG=web/public/config.js

# Copy config/config.env.example to config.env if it does not exist
if [ -f "$ROOT_CONFIG_ENV" ]; then
    echo "Skipping copying config/config.env. File exists already."
else 
    cp config/config.env.example config/config.env
    echo "Copied config/config.env.example to config/config.env."
fi

# Copy config/companion/.env.example to companion/.env if it does not exist
if [ -f "$COMPANION_ENV" ]; then
    echo "Skipping copying config/companion/.env. File exists already."
else 
    cp config/companion/.env.example config/companion/.env
    echo "Copied config/companion/.env.example to config/companion/.env."
fi

# Copy config/web/config.js to web/public/config.js if it does not exist
if [ -f "$WEB_CONFIG" ]; then
    echo "Skipping copying web/public/config.js. File exists already."
else 
    cp config/web/config.js web/public/config.js
    echo "Copied web/public/config.js to web/public/config.js."
fi

# Build Docker images as a prebuild step
# docker-compose build 

# Pull the Docker images as a prebuild step
# docker-compose pull