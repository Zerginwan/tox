# syntax=docker/dockerfile:1

FROM python:3.9-bullseye

WORKDIR /app

COPY . .
RUN mkdir -p /etc/cron.d && echo "* * * * * find /app/temp_files/ -type f -mtime +0 -delete\n" > /etc/cron.d/delete_old_reports
RUN mkdir -p /app/temp_files/ \
    && apt update  \
    && apt install -y \
    pandoc \
    && pip3 install -r requirements.txt \
    && pip3 install psycopg2-binary \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

EXPOSE 80

CMD ["python", "app.py"]