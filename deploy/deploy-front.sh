#!/usr/bin/env bash
# Déploie le build Vite vers le serveur Ubuntu.
# Usage : ./deploy/deploy-front.sh sysadmin@VOTRE_IP
set -euo pipefail

REMOTE="${1:-}"
REMOTE_DIR="/var/www/html/react/event-flow-hub"

if [[ -z "$REMOTE" ]]; then
  echo "Usage: $0 user@serveur"
  exit 1
fi

cd "$(dirname "$0")/.."

echo "→ Build production..."
npm run build

if [[ ! -f dist/index.html ]]; then
  echo "Erreur : dist/index.html introuvable après le build."
  exit 1
fi

echo "→ Upload vers ${REMOTE}:${REMOTE_DIR} ..."
rsync -avz --delete dist/ "${REMOTE}:${REMOTE_DIR}/"

echo "→ Vérification distante..."
ssh "$REMOTE" "test -f ${REMOTE_DIR}/index.html && ls -la ${REMOTE_DIR}/index.html"

echo "→ Reload nginx..."
ssh "$REMOTE" "sudo nginx -t && sudo systemctl reload nginx"

echo "✓ Déploiement terminé. Testez : https://www.hkeventscd.com/"
