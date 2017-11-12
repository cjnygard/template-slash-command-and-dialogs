FROM node:9.0.0

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV NODE_ENV ""
COPY package.json /usr/src/app/
RUN npm install && npm cache clean --force
COPY . /usr/src/app

ENV DEBUG slash-command-template
CMD [ "npm", "start" ]
