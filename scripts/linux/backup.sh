#!/usr/bin/env sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd); cd "$ROOT"
OUTPUT=${1:-backup-$(date +%Y%m%d-%H%M%S).sql}
docker compose exec -T postgres pg_dump -U anchor -d anchor_circle > "$OUTPUT"
echo "Backup created: $OUTPUT"
