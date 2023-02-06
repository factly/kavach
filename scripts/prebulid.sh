ROOT_CONFIG_ENV=config.env
COMPANION_ENV=companion/.env
WEB_CONFIG=web/public/config.js

# Copy config/config.env.example to config.env if it does not exist
if [ -f "$ROOT_CONFIG_ENV" ]; then
    echo "Skipping copying config.env. File exists already."
else 
    cp config/config.env.example config.env
    echo "Copied config/config.env.example to config.env."
fi

# Copy config/companion/.env.example to companion/.env if it does not exist
if [ -f "$COMPANION_ENV" ]; then
    echo "Skipping copying companion/.env. File exists already."
else 
    cp config/companion/.env.example companion/.env
    echo "Copied config/companion/.env.example to companion/.env."
fi

# Copy config/web/config.js to web/public/config.js if it does not exist
if [ -f "$COMPANION_ENV" ]; then
    echo "Skipping copying web/public/config.js. File exists already."
else 
    cp config/web/config.js web/public/config.js
    echo "Copied copying web/public/config.js to web/public/config.js."
fi

# Build Docker images as a prebuild step
docker-compose build 

# Pull the Docker images as a prebuild step
docker-compose pull