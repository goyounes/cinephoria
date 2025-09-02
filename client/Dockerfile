# DOCKERFILE CLIENT REACT - DÉVELOPPEMENT
# Ce fichier construit un conteneur qui expose un serveur de développement React
# avec hot-reload pour les modifications en temps réel

# Image Node.js officielle version 22 (complète)
FROM node:22 

# Définit le répertoire de travail dans le conteneur
WORKDIR /app

# Copie les fichiers de configuration des dépendances
COPY package*.json ./

# Installation de toutes les dépendances (dev + production)
RUN npm install

# Copie tout le code source de l'application React
COPY . .

# Expose le port 3000 pour le serveur de développement React
EXPOSE 3000

# Commande pour démarrer le serveur de développement avec hot-reload
CMD ["npm", "start"]