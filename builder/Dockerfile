FROM node:25-alpine

RUN apk update && apk add --no-cache git libc6-compat openssl

VOLUME [ "/data" ]

WORKDIR /root

COPY build.sh .
RUN chmod +x build.sh

ENTRYPOINT [ "./build.sh" ]

