#!/bin/sh

# SSL Certificate initialization script for nginx-ssl container
DOMAIN="${DOMAIN:-showcase.cinephoria.net}"
EMAIL="admin@cinephoria.net"

echo "Starting SSL certificate initialization for domain: $DOMAIN"

# Create basic nginx config that works with certbot nginx plugin
echo "Creating initial nginx configuration..."
cat > /etc/nginx/nginx.conf << EOF
events { 
    worker_connections 1024; 
}

http {
    server {
        listen 80;
        server_name $DOMAIN;
        
        location / {
            proxy_pass http://nginx_frontend:80;
            proxy_set_header Host \$host;
            proxy_set_header X-Forwarded-For \$remote_addr;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}
EOF

# Handle localhost vs real domain
if [ "$DOMAIN" = "localhost" ]; then
    echo "Domain is localhost - skipping SSL (HTTP only)"
else
    # Check if valid certificates already exist
    if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ] && openssl x509 -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem -noout -checkend 86400 2>/dev/null; then
        echo "Valid SSL certificates already exist for $DOMAIN, configuring nginx..."
        # Use existing certificates to configure nginx
        nginx -g "daemon on;"
        sleep 2
        certbot --nginx -d $DOMAIN --cert-name $DOMAIN --non-interactive --no-eff-email
        nginx -s quit
        sleep 2
    else
        echo "No valid certificates found, obtaining new ones with certbot nginx plugin..."
        # Start nginx for certbot to configure
        nginx -g "daemon on;"
        sleep 2
        # Use certbot nginx plugin to automatically configure SSL
        if certbot --nginx -d $DOMAIN --email $EMAIL --agree-tos --non-interactive --redirect; then
            echo "SSL certificates obtained and nginx configured automatically!"
        else
            echo "Certbot nginx plugin failed, continuing with HTTP only"
        fi
        # Stop daemon nginx
        nginx -s quit
        sleep 2
    fi
fi

# Setup automatic certificate renewal
echo "0 2 * * * /usr/bin/certbot renew --quiet && /usr/sbin/nginx -s reload" > /etc/crontabs/root
crond

# Start nginx in foreground mode
exec nginx -g "daemon off;"