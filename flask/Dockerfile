# syntax=docker/dockerfile:1

FROM python:3.9-bullseye

WORKDIR /app

COPY . .
RUN apt update &&\
    apt install -y \
    python3 \
    python3-pip \
    uwsgi-core \
    uwsgi-plugin-python3 \
    pandoc \
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
