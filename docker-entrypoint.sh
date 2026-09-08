#!/bin/sh
set -e

npx prisma db push --skip-generate
npm run db:seed

exec dumb-init -- node_modules/.bin/next start
