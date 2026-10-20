#!/usr/bin/env sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd); cd "$ROOT"
[ -f .env ] || cp .env.example .env
docker compose up -d --build
docker compose ps
echo 'Mobile: http://localhost:8080  Admin: http://localhost:8080/admin/'
