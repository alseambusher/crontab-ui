# docker run -d -p 8000:8000 alseambusher/crontab-ui
FROM alpine:3.5

LABEL maintainer "@alseambusher"
LABEL description "Crontab-UI docker"

RUN   apk --no-cache add \
      nodejs \
      wget \
      curl \
      supervisor

COPY supervisord.conf /etc/supervisord.conf      

RUN   npm install -g crontab-ui

ENV   HOST 0.0.0.0

ENV   PORT 8000

EXPOSE $PORT

CMD ["supervisord", "-c", "/etc/supervisord.conf"]
