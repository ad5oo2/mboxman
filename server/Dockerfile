FROM ubuntu:latest

ARG DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

RUN apt-get update && apt-get dist-upgrade -y && \
    apt-get install -y cron curl

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -

RUN apt-get update && apt-get install -y nodejs

VOLUME ["/exporter"]

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
COPY . .
RUN npx prisma generate

EXPOSE 3001
CMD /usr/src/app/start.sh