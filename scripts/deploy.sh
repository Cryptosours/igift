#!/usr/bin/env bash
# iGift — Deploy to VPS via rsync + Docker
# Usage: ./scripts/deploy.sh

set -euo pipefail

VPS_USER="${DEPLOY_USER:-igift}"
VPS_IP="${DEPLOY_HOST:?Set DEPLOY_HOST}"
VPS_PATH="${DEPLOY_PATH:-/opt/igift}"
SSH_KEY="${DEPLOY_SSH_KEY:?Set DEPLOY_SSH_KEY}"

echo "=== iGift Deploy ==="
echo "Target: ${VPS_USER}@${VPS_IP}:${VPS_PATH}"

# Sync project files (exclude unnecessary files)
echo "--- Syncing files ---"
rsync -avz --delete \
  -e "ssh -i ${SSH_KEY}" \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.turbo' \
  --exclude='.git' \
  --exclude='.remember' \
  --exclude='.DS_Store' \
  --exclude='docs/research' \
  ./ "${VPS_USER}@${VPS_IP}:${VPS_PATH}/"

# Build and start on VPS
echo "--- Building and starting containers ---"
ssh -i "${SSH_KEY}" "${VPS_USER}@${VPS_IP}" "
  cd ${VPS_PATH}
  docker compose down --remove-orphans 2>/dev/null || true
  docker compose build --no-cache
  docker compose up -d
  echo '--- Container status ---'
  docker compose ps
"

echo "=== Deploy complete ==="
echo "App running at https://igift.app"
