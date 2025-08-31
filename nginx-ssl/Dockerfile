FROM nginx:alpine

# Install certbot for Let's Encrypt
RUN apk add --no-cache certbot certbot-nginx

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create directories for SSL certificates and challenge files
RUN mkdir -p /var/www/certbot /etc/letsencrypt/live /etc/letsencrypt/archive

# Create SSL initialization script directly in Dockerfile
RUN echo '#!/bin/sh' > /usr/local/bin/init-ssl.sh && \
    echo 'DOMAIN="newdemo.cinephoria.net"' >> /usr/local/bin/init-ssl.sh && \
    echo 'EMAIL="admin@cinephoria.net"' >> /usr/local/bin/init-ssl.sh && \
    echo 'echo "Starting SSL certificate initialization for $DOMAIN"' >> /usr/local/bin/init-ssl.sh && \
    echo 'if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then' >> /usr/local/bin/init-ssl.sh && \
    echo '    echo "Certificates not found. Starting nginx for initial HTTP challenge..."' >> /usr/local/bin/init-ssl.sh && \
    echo '    nginx -g "daemon on;"' >> /usr/local/bin/init-ssl.sh && \
    echo '    echo "Requesting SSL certificate for $DOMAIN..."' >> /usr/local/bin/init-ssl.sh && \
    echo '    certbot certonly --webroot --webroot-path=/var/www/certbot --email $EMAIL --agree-tos --no-eff-email -d $DOMAIN' >> /usr/local/bin/init-ssl.sh && \
    echo '    if [ $? -eq 0 ]; then' >> /usr/local/bin/init-ssl.sh && \
    echo '        echo "Certificate obtained successfully!"' >> /usr/local/bin/init-ssl.sh && \
    echo '        nginx -s quit' >> /usr/local/bin/init-ssl.sh && \
    echo '    else' >> /usr/local/bin/init-ssl.sh && \
    echo '        echo "Failed to obtain certificate. Starting nginx without SSL..."' >> /usr/local/bin/init-ssl.sh && \
    echo '        exec nginx -g "daemon off;"' >> /usr/local/bin/init-ssl.sh && \
    echo '    fi' >> /usr/local/bin/init-ssl.sh && \
    echo 'else' >> /usr/local/bin/init-ssl.sh && \
    echo '    echo "SSL certificate already exists for $DOMAIN"' >> /usr/local/bin/init-ssl.sh && \
    echo 'fi' >> /usr/local/bin/init-ssl.sh && \
    echo 'echo "Starting nginx with SSL configuration..."' >> /usr/local/bin/init-ssl.sh && \
    echo 'echo "0 2 * * * /usr/bin/certbot renew --quiet && /usr/sbin/nginx -s reload" > /etc/crontabs/root' >> /usr/local/bin/init-ssl.sh && \
    echo 'crond' >> /usr/local/bin/init-ssl.sh && \
    echo 'exec nginx -g "daemon off;"' >> /usr/local/bin/init-ssl.sh && \
    chmod +x /usr/local/bin/init-ssl.sh

# Expose HTTP and HTTPS ports
EXPOSE 80 443

# Start with certificate initialization and nginx
ENTRYPOINT ["/usr/local/bin/init-ssl.sh"]