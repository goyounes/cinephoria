# DOCKERFILE SERVEUR NODE.JS - PRODUCTION
# Ce fichier construit un conteneur optimisé pour la production
# avec une image légère et sans les dépendances de développement

# Image Node.js slim (allégée) version 22 pour optimiser la taille
FROM node:22-slim

# Définit le répertoire de travail dans le conteneur
WORKDIR /app

# Copie uniquement le fichier package.json pour optimiser le cache Docker
COPY package.json ./

# Installation des dépendances de production uniquement (exclut devDependencies)
RUN npm install --omit=dev

# Copie tout le code source du serveur
COPY . .

# Nettoyage des fichiers de test
RUN rm -rf __tests__ && \
    find utils -name "*.test.js" -delete

# Expose le port 8080 pour l'API backend
EXPOSE 8080

# Commande pour démarrer le serveur en mode production
CMD ["npm", "start"]