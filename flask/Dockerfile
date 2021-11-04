# syntax=docker/dockerfile:1

FROM python:3.9-bullseye

WORKDIR /app

COPY . .
RUN apt update && \
    apt install -y \
    pandoc \
    && pip3 install -r requirements.txt \
    && pip3 install psycopg2-binary \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

EXPOSE 80

CMD ["python", "app.py"]