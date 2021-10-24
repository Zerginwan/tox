# tox
## Поможем воткнуть МФЦ туда, куда нужно!
### Требования:
PostgreSQL >= 13
PostGIS
Debian-like Linux + docker-compose + docker + yq:  
нужны для тестового развертывания нужен с помощью install.sh.  
Проект по архитектуре cloud-native и docker-compose используется лишшь для примера.   

### Описание компонентов:
#### traefik
LoadBalancer и обеспечение взаимодействия по протоколу HTTPS. 
Так же занимается выдачей сертификатов
Слушает порт 443. Порт переназначается внутри docker-compose.
#### JS
Nodejs + статика. Все, что отвечает за веб-интерфейс.  
 
 - Frontend
 - Backend 
 - - Авторизация
 - - Взаимодействие с картами
 - - Выбирает конфигурационные настройки для обработки питоновской частью
#### flask
Веб-сервер для обвязывания функций питона в http-api
#### memcached
Кэш для результата долгих запросов DA-функций в БД.
Должен быть сброшен при поступлении новых данных в БД!
### Установка:
1. Скопировать папку проекта (кроме папки scripts - она не является необходимой)
2. создать .config.yml
```
db:
  host: "tox.cart.is"
  port: 5432
  username: "tox"
  database: "tox"
  password: "defaultPASSWORDforTOX"
  dialect: "postgres"

flask:
  host: flask

js:
  host: js

memcached:
  host: memcached
  port: 11211
  expiration: 2591000
  max_pool_size: 2

auth:
  secret: "eyJhbGciOiJIUzUxMiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6InRveCIsImV4cCI6MTYzNDI4MTM0NCwiaWF0IjoxNjM0MjgxMzQ0fQ.Dpf4dwCn-gOZthR0Ttv-bRvWGSMZQcTfP-y_BmiH4-h4GqI0jD-NyOyftSmu-GmKtUPtR40I95HMTSh_hRE9xQ"
```
3. Настроить переменные в docker-compose:  

- email владельца домена (строка 28)
- Hostname домена (строка 41)

4. /bin/bash ./install.sh

5. Залить в базу дамп из tox.sql.gz

### Принцип хранения данных в базе

Все время-зависимые датасеты хранятся в таблицах с одинаковыми названиями и разными префиксами.  
Если таблица с указанным префиксом не найдена, подгружается таблица без префикса.  
Такими таблицами являются таблицы, содержащие:  
- Информацию о населении
- Информацию о существующих объектах СКБ
- Предрассчитанная карта.

Формат: YYYY_TABLE  
Таким образом можно загружать практически неограниченное количество датасетов.  

