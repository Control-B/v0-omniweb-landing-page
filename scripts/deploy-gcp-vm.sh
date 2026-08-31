#!/usr/bin/env bash
set -euo pipefail

# Omniweb AI — 1-Command Cost-Effective GCP VM Deployment Script
echo "========================================================================"
echo "🚀 DEPLOYING OMNIWEB CONTACT CENTER ON GCP VM"
echo "========================================================================"

if [ ! -f ".env.gcp" ]; then
    echo "⚠️  .env.gcp not found. Creating from .env.gcp.example..."
    cp .env.gcp.example .env.gcp
    echo "👉 Please edit .env.gcp with your API keys if you haven't already."
fi

# Ensure Docker & Docker Compose are present
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker and Docker Compose plugin..."
    sudo apt-get update -y
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
fi

echo "🔄 Pulling and building Docker services..."
docker compose -f docker-compose.gcp.yml pull postgres redis caddy || true
docker compose -f docker-compose.gcp.yml build --no-cache

echo "🚀 Starting Omniweb Autonomous Contact Center..."
docker compose -f docker-compose.gcp.yml up -d --remove-orphans

echo "⏳ Waiting for services to become healthy..."
sleep 8

echo "📊 Container Status:"
docker compose -f docker-compose.gcp.yml ps

echo "========================================================================"
echo "✅ Omniweb Autonomous Contact Center is LIVE on your GCP VM!"
echo "   - Web App & War Room: http://$(curl -s ifconfig.me || echo 'YOUR_VM_IP')"
echo "   - Backend Health API: http://$(curl -s ifconfig.me || echo 'YOUR_VM_IP')/health"
echo "========================================================================"
