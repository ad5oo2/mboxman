FROM node:25-alpine

RUN apk update && apk add openssl

VOLUME [ "/data", "/exporter" ]

WORKDIR /data/backend

EXPOSE 3001

ENTRYPOINT [ "/data/backend/start.sh" ]
