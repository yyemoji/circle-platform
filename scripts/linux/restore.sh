#!/usr/bin/env sh
set -eu
[ "$#" -eq 1 ] || { echo 'Usage: restore.sh backup.sql' >&2; exit 2; }
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd); cd "$ROOT"
test -f "$1" || { echo 'Backup file not found' >&2; exit 2; }
docker compose exec -T postgres psql -U anchor -d anchor_circle < "$1"
