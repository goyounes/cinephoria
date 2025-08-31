FROM node:22-slim

WORKDIR /app

COPY package.json ./

RUN npm install --omit=dev

COPY . .

# Remove test files from production build
RUN rm -rf __tests__ && \
    find utils -name "*.test.js" -delete

EXPOSE 8080

CMD ["npm", "start"]