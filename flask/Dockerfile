# syntax=docker/dockerfile:1

FROM alpine:latest

WORKDIR /app

COPY . .
RUN apk add --no-cache \
    python3 \
    cmd:pip3 \
    uwsgi-python3 \
    && pip3 install -r requirements.txt \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* 

EXPOSE 80 9191

CMD ["uwsgi", \
            "--http-socket", ":80", \
#            "--threads", "2", \
#            "--processes", "4" \
            "--stats", "localhost:9191",\
            "--plugin", "python3",\
            "--wsgi-file", "app.py",\
            "--callable", "app"]

