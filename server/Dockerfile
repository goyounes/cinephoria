# DOCKERFILE SERVEUR NODE.JS - PRODUCTION
# Multi-stage build: compile TypeScript then run with minimal image

# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

# Install all dependencies (dev included, needed for tsc)
COPY package.json ./
RUN npm install

# Copy source code and compile TypeScript
COPY . .
RUN npx tsc

# ── Stage 2: Production ────────────────────────────────────────
FROM node:22-slim

WORKDIR /app

# Install production dependencies only
COPY package.json ./
RUN npm install --omit=dev

# Copy compiled JavaScript from builder stage
COPY --from=builder /app/dist ./dist

# Expose le port 8080 pour l'API backend
EXPOSE 8080

# Commande pour démarrer le serveur en mode production
ENV NODE_ENV=production
CMD ["node", "dist/server.js"]
