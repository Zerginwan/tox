# Билдим в полном образе
FROM node as build

WORKDIR /tox_app

COPY .  .

RUN npm install

# запускаем в маленьком образе для экономии места
FROM node:16-alpine as deploy

WORKDIR /tox_app
COPY --from=build /tox_app .

# HTTP-порт, который будет слушать сервер
EXPOSE 3000

CMD ["npm", "start"]
