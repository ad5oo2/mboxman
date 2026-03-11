FROM node:25-alpine

RUN apk update && apk add git

VOLUME [ "/data" ]

WORKDIR /root

COPY build.sh .

ENTRYPOINT [ "/root/build.sh" ]

