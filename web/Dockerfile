# pull official base image
FROM node:16.14-alpine

# set working directory
WORKDIR /app

# install app dependencies
COPY package* .

RUN npm install --legacy-peer-deps

# add app
COPY . ./

# start app
CMD ["npm", "start"]