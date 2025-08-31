FROM nginx:alpine

# Install certbot for Let's Encrypt, OpenSSL for self-signed certificates, and gettext for envsubst
RUN apk add --no-cache certbot certbot-nginx openssl gettext

# Copy nginx configuration template
COPY nginx.conf.template /etc/nginx/nginx.conf.template

# Create directories for SSL certificates and challenge files
RUN mkdir -p /var/www/certbot /etc/letsencrypt/live /etc/letsencrypt/archive

# Create SSL initialization script with self-signed placeholder support and template substitution
RUN echo '#!/bin/sh' > /usr/local/bin/init-ssl.sh && \
    echo '' >> /usr/local/bin/init-ssl.sh && \
    echo '# Use DOMAIN environment variable directly' >> /usr/local/bin/init-ssl.sh && \
    echo 'DOMAIN=${DOMAIN:-"newdemo.cinephoria.net"}' >> /usr/local/bin/init-ssl.sh && \
    echo 'EMAIL="admin@cinephoria.net"' >> /usr/local/bin/init-ssl.sh && \
    echo '' >> /usr/local/bin/init-ssl.sh && \
    echo 'echo "Starting SSL certificate initialization for domain: $DOMAIN"' >> /usr/local/bin/init-ssl.sh && \
    echo '' >> /usr/local/bin/init-ssl.sh && \
    echo '# Generate nginx.conf from template with domain substitution' >> /usr/local/bin/init-ssl.sh && \
    echo 'echo "Generating nginx config for domain: $DOMAIN"' >> /usr/local/bin/init-ssl.sh && \
    echo 'export DOMAIN' >> /usr/local/bin/init-ssl.sh && \
    echo 'envsubst '"'"'${DOMAIN}'"'"' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf' >> /usr/local/bin/init-ssl.sh && \
    echo '' >> /usr/local/bin/init-ssl.sh && \
    echo '' >> /usr/local/bin/init-ssl.sh && \
    echo '# Create self-signed placeholder certificates if none exist' >> /usr/local/bin/init-ssl.sh && \
    echo 'if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then' >> /usr/local/bin/init-ssl.sh && \
    echo '    echo "Creating self-signed placeholder certificates..."' >> /usr/local/bin/init-ssl.sh && \
    echo '    mkdir -p /etc/letsencrypt/live/$DOMAIN' >> /usr/local/bin/init-ssl.sh && \
    echo '    openssl req -x509 -nodes -days 1 -newkey rsa:2048 \' >> /usr/local/bin/init-ssl.sh && \
    echo '        -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \' >> /usr/local/bin/init-ssl.sh && \
    echo '        -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem \' >> /usr/local/bin/init-ssl.sh && \
    echo '        -subj "/CN=$DOMAIN"' >> /usr/local/bin/init-ssl.sh && \
    echo '    echo "Placeholder certificates created"' >> /usr/local/bin/init-ssl.sh && \
    echo 'fi' >> /usr/local/bin/init-ssl.sh && \
    echo '' >> /usr/local/bin/init-ssl.sh && \
    echo '# Start nginx with SSL configuration (using placeholder or real certs)' >> /usr/local/bin/init-ssl.sh && \
    echo 'echo "Starting nginx with SSL configuration..."' >> /usr/local/bin/init-ssl.sh && \
    echo 'nginx -g "daemon on;"' >> /usr/local/bin/init-ssl.sh && \
    echo '' >> /usr/local/bin/init-ssl.sh && \
    echo '# Try to get real certificates from Lets Encrypt' >> /usr/local/bin/init-ssl.sh && \
    echo 'echo "Attempting to obtain real SSL certificates..."' >> /usr/local/bin/init-ssl.sh && \
    echo 'certbot certonly --webroot --webroot-path=/var/www/certbot --email $EMAIL --agree-tos --no-eff-email -d $DOMAIN --force-renewal' >> /usr/local/bin/init-ssl.sh && \
    echo '' >> /usr/local/bin/init-ssl.sh && \
    echo 'if [ $? -eq 0 ]; then' >> /usr/local/bin/init-ssl.sh && \
    echo '    echo "Real SSL certificates obtained! Reloading nginx..."' >> /usr/local/bin/init-ssl.sh && \
    echo '    nginx -s reload' >> /usr/local/bin/init-ssl.sh && \
    echo 'else' >> /usr/local/bin/init-ssl.sh && \
    echo '    echo "Failed to obtain real certificates. Continuing with placeholder certificates."' >> /usr/local/bin/init-ssl.sh && \
    echo 'fi' >> /usr/local/bin/init-ssl.sh && \
    echo '' >> /usr/local/bin/init-ssl.sh && \
    echo '# Setup automatic certificate renewal' >> /usr/local/bin/init-ssl.sh && \
    echo 'echo "0 2 * * * /usr/bin/certbot renew --quiet && /usr/sbin/nginx -s reload" > /etc/crontabs/root' >> /usr/local/bin/init-ssl.sh && \
    echo 'crond' >> /usr/local/bin/init-ssl.sh && \
    echo '' >> /usr/local/bin/init-ssl.sh && \
    echo '# Keep nginx running in foreground' >> /usr/local/bin/init-ssl.sh && \
    echo 'nginx -s quit  # Stop the daemon version' >> /usr/local/bin/init-ssl.sh && \
    echo 'exec nginx -g "daemon off;"  # Start in foreground' >> /usr/local/bin/init-ssl.sh && \
    chmod +x /usr/local/bin/init-ssl.sh

# Expose HTTP and HTTPS ports
EXPOSE 80 443

# Start with certificate initialization and nginx
ENTRYPOINT ["/usr/local/bin/init-ssl.sh"]