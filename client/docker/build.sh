#!/bin/sh

git clone https://github.com/ad5oo2/mboxman /root/src

cd /root/src/client

npm install
npm run build
mkdir -p /data/frontend
cp -R /root/src/client/dist/* /data/frontend
