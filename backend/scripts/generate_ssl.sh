#!/bin/bash
# -------------------------------------------------------------
# DAGANGPLAY AUTO-SSL SCRIPT (LET'S ENCRYPT)
# -------------------------------------------------------------
# Script ini dipanggil oleh Backend NestJS (via child_process)
# ketika sistem mendeteksi bahwa domain merchant telah di-pointing
# dengan valid (A Record / CNAME resolved) ke IP Server ini.

DOMAIN=$1
EMAIL="support@dagangplay.com"

if [ -z "$DOMAIN" ]; then
    echo "Error: Domain argument is missing."
    exit 1
fi

echo "[SSL Config] Generating Let's Encrypt SSL for $DOMAIN..."

# Meminta sertifikat gratis menggunakan certbot
# (Menggunakan --non-interactive agar tidak tersangkut di terminal backend)
certbot certonly --webroot -w /var/www/html -d "$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive

# Periksa hasil exit code
if [ $? -eq 0 ]; then
    echo "[SSL Config] SUCCESS: SSL berhasil diterbitkan untuk $DOMAIN."
    # Opsional: Reload Nginx secara aman
    systemctl reload nginx
    exit 0
else
    echo "[SSL Config] FAILED: Gagal menerbitkan SSL untuk $DOMAIN."
    exit 1
fi
