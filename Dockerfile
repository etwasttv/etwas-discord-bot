FROM node:18

WORKDIR /workspace/bot

COPY ./bot/package*.json ./

RUN npm ci
