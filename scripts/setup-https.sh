#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${1:-price.lengziyu.cn}"
EMAIL="${2:-}"
APP_PORT="${3:-3014}"
NGINX_CONF="/etc/nginx/conf.d/${DOMAIN}.conf"

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "ERROR: missing command: $1"
    exit 1
  fi
}

run_as_root() {
  if [[ "${EUID}" -eq 0 ]]; then
    "$@"
  else
    sudo "$@"
  fi
}

install_certbot_if_missing() {
  if command -v certbot >/dev/null 2>&1; then
    return
  fi

  echo "certbot not found, installing..."
  if command -v dnf >/dev/null 2>&1; then
    run_as_root dnf install -y certbot python3-certbot-nginx
  elif command -v yum >/dev/null 2>&1; then
    run_as_root yum install -y certbot python3-certbot-nginx
  elif command -v apt-get >/dev/null 2>&1; then
    run_as_root apt-get update
    run_as_root apt-get install -y certbot python3-certbot-nginx
  else
    echo "ERROR: unsupported package manager, install certbot manually."
    exit 1
  fi
}

need_cmd nginx
need_cmd systemctl
install_certbot_if_missing
need_cmd certbot

echo "[1/6] Write nginx reverse proxy: ${NGINX_CONF}"
run_as_root mkdir -p /etc/nginx/conf.d
run_as_root tee "${NGINX_CONF}" >/dev/null <<EOF
server {
  listen 80;
  server_name ${DOMAIN};
  client_max_body_size 20m;

  location / {
    proxy_pass http://127.0.0.1:${APP_PORT};
    proxy_http_version 1.1;

    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
EOF

echo "[2/6] Reload nginx"
run_as_root nginx -t
run_as_root systemctl reload nginx

echo "[3/6] Issue certificate by certbot"
if [[ -n "${EMAIL}" ]]; then
  run_as_root certbot --nginx -d "${DOMAIN}" --agree-tos --no-eff-email -m "${EMAIL}" --redirect -n
else
  run_as_root certbot --nginx -d "${DOMAIN}" --agree-tos --register-unsafely-without-email --redirect -n
fi

echo "[4/6] Configure renewal deploy hook"
run_as_root mkdir -p /etc/letsencrypt/renewal-hooks/deploy
run_as_root tee /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh >/dev/null <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
systemctl reload nginx
EOF
run_as_root chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh

echo "[5/6] Enable certbot timer"
run_as_root systemctl enable --now certbot-renew.timer || true
run_as_root systemctl list-timers --all | grep certbot || true

echo "[6/6] Verify renewal"
run_as_root certbot renew --dry-run

echo "OK: https://${DOMAIN} is configured with auto-renew."
