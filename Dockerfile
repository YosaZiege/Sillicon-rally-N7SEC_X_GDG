FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install -D ts-node typescript @types/node

ENV NODE_ENV=development
ENV DATABASE_URL=postgres://postgres:password@db:5432/mydatabase

CMD ["npx", "ts-node", "scripts/initDb.ts"]

