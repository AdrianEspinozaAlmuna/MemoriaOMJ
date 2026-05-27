FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000

CMD ["sh", "-c", "npx prisma generate --schema=./prisma/schema.prisma && node prisma/src/index.js"]