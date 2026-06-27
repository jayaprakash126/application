FROM node:22

WORKDIR /app

COPY backend/package*.json ./backend/

WORKDIR /app/backend

RUN npm install

WORKDIR /app

COPY . .

EXPOSE 3000

WORKDIR /app/backend

CMD ["node", "server.js"]
