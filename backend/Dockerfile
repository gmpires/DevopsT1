FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

COPY db.json .

EXPOSE 3000

CMD ["node", "server.js"]
