FROM node:18.17.0

# ENV PORT 7770

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Copying source files
COPY . /app

# Installing dependencies
RUN npm install


# Running the app
CMD "npm" "run" "dev"