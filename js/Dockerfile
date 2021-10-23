FROM node

WORKDIR /tox_app

COPY .  .

RUN npm install

WORKDIR /tox_app/client

RUN npm install && npm run build && rm -rf src && rm -rf public && rm -rf node_modules

EXPOSE 3000

WORKDIR /tox_app

CMD ["npm", "start"]
