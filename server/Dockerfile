FROM node:25-alpine

RUN apk update && apk add --no-cache openssl

VOLUME [ "/data", "/etc/crontabs/", "/exporter" ]

WORKDIR /data/backend

EXPOSE 3001

ENTRYPOINT [ "./start.sh" ]
