FROM node:24

WORKDIR /frontend

COPY ./package.json /frontend/package.json

COPY ./package-lock.json /frontend/package-lock.json

RUN npm install

COPY ./ /frontend/

RUN npm run build