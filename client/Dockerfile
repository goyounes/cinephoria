# this file will build a container that exposes a react development server
FROM node:22 

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]