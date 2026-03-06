#!/bin/sh

cp /usr/src/app/crontab /etc/crontab
rm /etc/cron.d/*
rm /etc/cron.daily/*
service cron start
node /usr/src/app/src/server.js