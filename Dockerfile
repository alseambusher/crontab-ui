# docker run -d -p 8000:8000 alseambusher/crontab-ui
FROM node:22-alpine AS build

WORKDIR /crontab-ui
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:22-alpine

ENV   CRON_PATH=/etc/crontabs
RUN   touch $CRON_PATH/root && chmod +x $CRON_PATH/root

RUN   apk --no-cache add \
      curl \
      supervisor \
      tini \
      tzdata

WORKDIR /crontab-ui

LABEL maintainer="@alseambusher"
LABEL description="Crontab-UI docker"

COPY --from=build /crontab-ui/node_modules ./node_modules
COPY . .

ENV   HOST=0.0.0.0
ENV   PORT=8000
ENV   CRON_IN_DOCKER=true

EXPOSE $PORT

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/ || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["supervisord", "-c", "/crontab-ui/supervisord.conf"]
