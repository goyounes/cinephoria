FROM nginx:alpine

# Install certbot for Let's Encrypt and OpenSSL for self-signed certificates
RUN apk add --no-cache certbot certbot-nginx openssl

# Create directories for SSL certificates and challenge files
RUN mkdir -p /var/www/certbot /etc/letsencrypt/live /etc/letsencrypt/archive

# Copy and set up the SSL initialization script
COPY init-ssl.sh /usr/local/bin/init-ssl.sh
RUN chmod +x /usr/local/bin/init-ssl.sh

# Expose HTTP and HTTPS ports
EXPOSE 80 443

# Start with certificate initialization and nginx
ENTRYPOINT ["/usr/local/bin/init-ssl.sh"]