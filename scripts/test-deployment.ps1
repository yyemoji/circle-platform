$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$required = @('compose.yaml','infra/mediamtx/mediamtx.yml','infra/nginx/nginx.conf','apps/api/Dockerfile','apps/mobile-web/Dockerfile','apps/admin-web/Dockerfile','scripts/windows/start-dev.ps1','scripts/windows/start-docker.ps1','scripts/windows/backup.ps1','scripts/windows/restore.ps1','scripts/linux/start.sh','scripts/linux/backup.sh','scripts/linux/restore.sh','scripts/seed-demo-data.ts')
foreach ($file in $required) { if (-not (Test-Path -LiteralPath (Join-Path $root $file))) { throw "Missing deployment file: $file" } }
$compose = Get-Content -Raw (Join-Path $root 'compose.yaml')
foreach ($service in @('postgres:','redis:','mediamtx:','api:','mobile-web:','admin-web:','nginx:')) { if (-not $compose.Contains($service)) { throw "Missing compose service: $service" } }
$envFile = Get-Content -Raw (Join-Path $root '.env.example')
foreach ($key in @('DATABASE_URL','JWT_ACCESS_SECRET','JWT_REFRESH_SECRET','STORAGE_LOCAL_PATH')) { if (-not $envFile.Contains($key)) { throw "Missing environment key: $key" } }
Write-Host 'Deployment manifest checks passed.'
