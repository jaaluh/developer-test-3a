FROM node:22-alpine3.19

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY ./package*.json /usr/src/app

COPY ./tsconfig*.json /usr/src/app

COPY ./vite.config.ts /usr/src/app

COPY ./eslint.config.js /usr/src/app

COPY ./index.html /usr/src/app

COPY ./src /usr/src/app/src

COPY ./public /usr/src/app/public

RUN mkdir -p /usr/src/app/node_modules/.vite

RUN chown -R node:node /usr/src/app/

RUN npm ci

USER node