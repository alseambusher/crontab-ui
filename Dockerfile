# docker run -d -p 8000:8000 stealthizer/crontab-ui
FROM  alpine:3.15.3

ENV   CRON_PATH /etc/crontabs
ENV   RCLONE_VERSION=current
ENV   ARCH=amd64

RUN   mkdir /crontab-ui; touch $CRON_PATH/root; chmod +x $CRON_PATH/root

WORKDIR /crontab-ui

LABEL maintainer "@stealthizer"
LABEL description "Crontab-UI docker with rclone"

RUN   apk --no-cache add \
      wget \
      curl \
      nodejs \
      npm \
      supervisor \
      tzdata \
      && cd /tmp \
      && wget -q http://downloads.rclone.org/rclone-${RCLONE_VERSION}-linux-${ARCH}.zip \
      && unzip /tmp/rclone-${RCLONE_VERSION}-linux-${ARCH}.zip \
      && mv /tmp/rclone-*-linux-${ARCH}/rclone /usr/bin \
      && rm -r /tmp/rclone* \
      && addgroup rclone \
      && adduser -h /config -s /bin/ash -G rclone -D rclone


COPY supervisord.conf /etc/supervisord.conf
COPY . /crontab-ui

RUN   npm install

ENV   HOST 0.0.0.0

ENV   PORT 8000

ENV   CRON_IN_DOCKER true

EXPOSE $PORT

CMD ["supervisord", "-c", "/etc/supervisord.conf"]
