# tox
## Поможем воткнуть МФЦ туда, куда нужно!
### Требования:
PostgreSQL >= 11  

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
### Установка:
1. Скопировать папку проекта (кроме папки scripts - она не является необходимой)
2. создать .config.yml
```
db:
  host: "IP или Доменное имя PSQL"
  port: 5432
  username: "str"
  database: "str"
  password: "str"

flask:
  host: flask

js:
  host: js
```
3. Настроить переменные в docker-compose:  

- email владельца домена (строка 28)
- Hostname домена (строка 41)

4. /bin/bash ./install.sh

5. Залить в базу датасеты

### Принцип хранения данных в базе

Все время-зависимые датасеты хранятся в таблицах с одинаковыми названиями и разными префиксами.  
Если таблица с указанным префиксом не найдена, подгружается таблица без префикса.  
Такими таблицами являются таблицы, содержащие:  
- Информацию о населении
- Информацию о существующих объектах СКБ
- Предрассчитанная карта.

Формат: М_YYYY_TABLE  
Таким образом можно загружать практически неограниченное количество датасетов.  

