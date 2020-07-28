# docker run -d -p 8000:8000 alseambusher/crontab-ui
FROM alpine:3.10

ENV   CRON_PATH /etc/crontabs
ENV   BASE_URL /

RUN   mkdir /crontab-ui; touch $CRON_PATH/root; chmod +x $CRON_PATH/root

WORKDIR /crontab-ui

LABEL maintainer "@alseambusher"
LABEL description "Crontab-UI docker"

RUN   apk --no-cache add \
      wget \
      curl \
      nodejs \
      npm \
      supervisor

COPY supervisord.conf /etc/supervisord.conf


COPY package*.json /crontab-ui/

RUN npm install

COPY . /crontab-ui

ENV   HOST 0.0.0.0

ENV   PORT 8000

ENV   CRON_IN_DOCKER true

EXPOSE $PORT

CMD ["supervisord", "-c", "/etc/supervisord.conf"]
