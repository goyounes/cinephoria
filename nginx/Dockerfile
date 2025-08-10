# Stage 1: Build React app using Node.js
FROM node:22 AS builder

WORKDIR /app

COPY client/package*.json ./
RUN npm install

# Copy the React app source code
COPY client/. .

# Build the React app (outputs static files to /app/build)
RUN npm run build

# Stage 2: Serve the built React app using Nginx
FROM nginx:alpine

# Copy the React build output from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy the custom nginx config from project root
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to allow incoming HTTP traffic
EXPOSE 80