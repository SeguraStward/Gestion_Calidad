#!/bin/bash

# Deploy a Hetzner: sincroniza código y reconstruye en el servidor
# Uso: ./deploy-hetzner.sh [frontend|backend|all]

set -e

SERVER="hetzner"
LOCAL_PATH="/home/segurastward/Documents/Workspace/Projects/gestion-calidad"
SERVER_PATH="/home/segurastward/gestion-calidad"
COMPOSE="docker compose -f docker-compose.yml -f docker-compose.hetzner.yml"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_step() { echo -e "${YELLOW}[STEP]${NC} $1"; }

sync_code() {
    log_step "Sincronizando código al servidor..."
    rsync -az --progress \
        --exclude='node_modules' \
        --exclude='.next' \
        --exclude='dist' \
        --exclude='.git' \
        --exclude='*.log' \
        --exclude='.env.local' \
        -e "ssh" \
        "$LOCAL_PATH/" "$SERVER:$SERVER_PATH/"
    log_info "Código sincronizado ✓"
}

build_and_up() {
    local component="$1"
    log_step "Construyendo y levantando en servidor..."

    # Use `=` (POSIX) instead of `==` so the script also runs under `sh`/`dash`,
    # not only bash — otherwise `dash` chokes on `==` and silently falls
    # through to the else branch, trying to build a service called "all".
    if [ "$component" = "all" ]; then
        BUILD_CMD="$COMPOSE build --no-cache frontend backend && $COMPOSE up -d"
    else
        BUILD_CMD="$COMPOSE build --no-cache $component && $COMPOSE up -d $component"
    fi

    ssh "$SERVER" "cd $SERVER_PATH && $BUILD_CMD"
    log_info "Contenedores levantados ✓"
}

show_status() {
    local component="$1"
    ssh "$SERVER" "cd $SERVER_PATH && echo '' && $COMPOSE ps && echo ''"
    if [ "$component" = "frontend" ] || [ "$component" = "all" ]; then
        ssh "$SERVER" "echo '=== Frontend ===' && docker logs agr-frontend --tail 15"
    fi
    if [ "$component" = "backend" ] || [ "$component" = "all" ]; then
        ssh "$SERVER" "echo '=== Backend ===' && docker logs agr-backend --tail 15"
    fi
}

main() {
    local component="${1:-all}"

    log_info "=== Deploy Hetzner: $component ==="
    echo ""

    sync_code
    build_and_up "$component"
    show_status "$component"

    echo ""
    log_info "Frontend: https://gestion-calidad.seguracorporations.com"
    log_info "Backend:  https://gestion-calidad-api.seguracorporations.com"
}

main "$@"
