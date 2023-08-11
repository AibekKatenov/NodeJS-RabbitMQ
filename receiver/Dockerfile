FROM node:18.14.2

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4002

# Команда для запуска приложения
CMD [ "node", "index.js" ]