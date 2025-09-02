# DOCKERFILE NGINX SSL PROXY - PRODUCTION
# Ce fichier configure un proxy SSL/HTTPS avec gestion automatique
# des certificats Let's Encrypt et support des certificats auto-signés

# Image Nginx légère basée sur Alpine Linux
FROM nginx:alpine

# Installation de Certbot pour Let's Encrypt et OpenSSL pour les certificats auto-signés
RUN apk add --no-cache certbot certbot-nginx openssl

# Création des répertoires nécessaires pour les certificats SSL et les défis de validation
RUN mkdir -p /var/www/certbot /etc/letsencrypt/live /etc/letsencrypt/archive

# Copie et configuration du script d'initialisation SSL
COPY init-ssl.sh /usr/local/bin/init-ssl.sh
RUN chmod +x /usr/local/bin/init-ssl.sh

# Exposition des ports HTTP (80) et HTTPS (443)
EXPOSE 80 443

# Point d'entrée avec initialisation des certificats et démarrage de Nginx
ENTRYPOINT ["/usr/local/bin/init-ssl.sh"]