FROM node:20-alpine AS builder
WORKDIR /build
RUN apk add --no-cache python3 make g++ openssl
COPY package.json ./
RUN npm install --legacy-peer-deps --ignore-scripts
COPY . .
RUN npx prisma generate || true
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache dumb-init openssl
COPY --from=builder /build/.next ./.next
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/package.json ./package.json
COPY --from=builder /build/prisma ./prisma
COPY --from=builder /build/lib ./lib
COPY --from=builder /build/public ./public
COPY docker-entrypoint.sh ./docker-entrypoint.sh
EXPOSE 3000
CMD ["sh", "./docker-entrypoint.sh"]