#!/bin/sh

git clone https://github.com/ad5oo2/mboxman /root/src

cd /root/src/client

npm install
npm run build
mkdir -p /data/frontend
cp -R /root/src/client/dist/* /data/frontend


mkdir -p /data/backend
cp -R /root/src/server/* /data/backend
cd /data/backend
npm install
npx prisma generate
npx prisma migrate deploy
chmod +x start.sh

