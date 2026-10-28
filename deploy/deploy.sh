#!/usr/bin/env bash
# Récupère les dernières images et (re)lance la stack si besoin.
# Appelé par le job de déploiement GitHub Actions et par le cron de la VM.
set -euo pipefail

cd "$(dirname "$(readlink -f "$0")")"

# Évite que le cron et le job de déploiement tournent en même temps
exec 9>.deploy.lock
if ! flock -n 9; then
	echo "[$(date -Is)] déploiement déjà en cours, abandon"
	exit 0
fi

echo "[$(date -Is)] pull des images"
docker compose pull --quiet

# Ne recrée que les conteneurs dont l'image a changé ou qui sont arrêtés
docker compose up -d --wait --remove-orphans

docker image prune -f >/dev/null
echo "[$(date -Is)] stack à jour"
