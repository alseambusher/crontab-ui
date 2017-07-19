# docker run -d -p 8000:8000 alseambusher/crontab-ui
FROM alpine:3.5

RUN   mkdir /crontab-ui; touch /etc/crontabs/root; chmod +x /etc/crontabs/root

WORKDIR /crontab-ui

LABEL maintainer "@alseambusher"
LABEL description "Crontab-UI docker"

RUN   apk --no-cache add \
      wget \
      curl \
      nodejs \
      supervisor

COPY supervisord.conf /etc/supervisord.conf
COPY . /crontab-ui

RUN   npm install

ENV   HOST 0.0.0.0

ENV   PORT 8000

ENV   CRON_PATH /etc/crontabs
ENV   CRON_IN_DOCKER true

EXPOSE $PORT

CMD ["supervisord", "-c", "/etc/supervisord.conf"]
