FROM node:22-alpine3.19

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY ./package*.json ./

COPY ./tsconfig.json ./

RUN npm ci

COPY ./src /usr/src/app/src

USER node