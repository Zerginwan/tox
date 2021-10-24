FROM node AS build

WORKDIR /tox_app

COPY .  .

WORKDIR /tox_app/client

RUN npm install && npm run build && rm -rf src && rm -rf public && rm -rf node_modules

FROM node AS final
WORKDIR /tox_app

COPY --from=build /tox_app/ /tox_app/
RUN npm install

EXPOSE 3001

CMD ["npm", "start"]
