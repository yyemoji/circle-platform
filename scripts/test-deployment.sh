#!/usr/bin/env sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
for file in compose.yaml infra/mediamtx/mediamtx.yml infra/nginx/nginx.conf apps/api/Dockerfile apps/mobile-web/Dockerfile apps/admin-web/Dockerfile scripts/linux/start.sh scripts/linux/backup.sh scripts/linux/restore.sh scripts/seed-demo-data.ts; do
  test -f "$ROOT/$file" || { echo "Missing deployment file: $file" >&2; exit 1; }
done
grep -q 'healthcheck:' "$ROOT/compose.yaml"
grep -q 'restart: unless-stopped' "$ROOT/compose.yaml"
echo 'Deployment manifest checks passed.'
