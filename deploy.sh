#!/bin/bash

# Script simplificado para desplegar usando build remoto
# Uso: ./deploy.sh [frontend|backend|all]

set -e

# Configuración
SERVER_USER="root"
SERVER_IP="138.197.211.207"
SSH_KEY="/home/segurastward/Documents/ssh/gcalidad-ssh-keys/home/khl0e/.ssh/gcalidad/gcalidad-droplet-key"
SERVER_PATH="/home/khloe/gestion-calidad"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

# Función principal
main() {
    local component="${1:-all}"
    
    log_info "=== Desplegando: $component ==="
    
    # Construir el comando según el componente
    if [ "$component" == "all" ]; then
        BUILD_CMD="docker compose build --no-cache frontend backend && docker compose up -d"
    else
        BUILD_CMD="docker compose build --no-cache $component && docker compose up -d $component"
    fi
    
    log_info "Ejecutando build en servidor (esto tardará unos minutos)..."
    
    # Ejecutar en servidor
    ssh -i "$SSH_KEY" ${SERVER_USER}@${SERVER_IP} << EOF
set -e
cd ${SERVER_PATH}

echo "Iniciando build de $component..."
$BUILD_CMD

echo ""
echo "Estado de contenedores:"
docker compose ps

echo ""
echo "Últimas líneas de logs:"
if [ "$component" == "frontend" ] || [ "$component" == "all" ]; then
    echo "=== Frontend ==="
    docker logs agr-frontend --tail 10
fi

if [ "$component" == "backend" ] || [ "$component" == "all" ]; then
    echo "=== Backend ==="
    docker logs agr-backend --tail 10
fi
EOF
    
    log_info "✓ Despliegue completado"
}

main "$@"
