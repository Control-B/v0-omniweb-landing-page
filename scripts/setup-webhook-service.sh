#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/home/banjahmarah/v0-omniweb-landing-page"
SERVICE_NAME="omniweb-webhook"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"

echo "========================================================================"
echo "🚀 INSTALLING OMNIWEB GITHUB CI/CD WEBHOOK SERVICE"
echo "========================================================================"

chmod +x "${REPO_DIR}/scripts/github-webhook-deploy.py"

echo "📝 Creating systemd service at ${SERVICE_FILE}..."
sudo bash -c "cat <<EOF > ${SERVICE_FILE}
[Unit]
Description=Omniweb GitHub CI/CD Webhook Service
After=network.target docker.service

[Service]
Type=simple
User=banjahmarah
WorkingDirectory=${REPO_DIR}
ExecStart=/usr/bin/python3 ${REPO_DIR}/scripts/github-webhook-deploy.py
Restart=always
RestartSec=5
Environment=PYTHONUNBUFFERED=1
Environment=WEBHOOK_PORT=9000
Environment=REPO_DIR=${REPO_DIR}
EnvironmentFile=-${REPO_DIR}/.env.gcp

[Install]
WantedBy=multi-user.target
EOF"

echo "🔄 Reloading systemd daemon and enabling service..."
sudo systemctl daemon-reload
sudo systemctl enable "${SERVICE_NAME}"
sudo systemctl restart "${SERVICE_NAME}"

echo "📊 Checking service status..."
sudo systemctl status "${SERVICE_NAME}" --no-pager | head -n 12

echo "🔄 Recreating Caddy to pick up reverse proxy routing to host..."
cd "${REPO_DIR}"
docker compose -f docker-compose.gcp.yml up -d --no-deps caddy

echo "========================================================================"
echo "✅ WEBHOOK CI/CD SERVICE IS ACTIVE!"
echo "   Endpoint: https://136.114.167.50.sslip.io/webhooks/deploy"
echo "   Internal: http://127.0.0.1:9000/health"
echo "========================================================================"
