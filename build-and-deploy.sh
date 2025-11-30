#!/bin/bash

# Script para build local y despliegue rápido al servidor
# Uso: ./build-and-deploy.sh [frontend|backend|all]

set -e  # Salir si hay errores

# Configuración
SERVER_USER="root"
SERVER_IP="138.197.211.207"
SSH_KEY="/home/segurastward/Documents/ssh/gcalidad-ssh-keys/home/khl0e/.ssh/gcalidad/gcalidad-droplet-key"
SERVER_PATH="/home/khloe/gestion-calidad"
LOCAL_PATH="/home/segurastward/Documents/Projects/gestion-calidad"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que Docker esté corriendo
check_docker() {
    if ! sudo docker info > /dev/null 2>&1; then
        log_error "Docker no está corriendo. Por favor inicia Docker."
        exit 1
    fi
    log_info "Docker está corriendo ✓"
}

# Build local del frontend
build_frontend_local() {
    log_info "Building frontend localmente..."
    cd "$LOCAL_PATH"
    sudo docker-compose build frontend
    log_info "Frontend build completado ✓"
}

# Build local del backend
build_backend_local() {
    log_info "Building backend localmente..."
    cd "$LOCAL_PATH"
    sudo docker-compose build backend
    log_info "Backend build completado ✓"
}

# Exportar imágenes Docker
export_images() {
    log_info "Exportando imágenes Docker..."
    cd "$LOCAL_PATH"
    
    # Crear directorio temporal
    mkdir -p /tmp/gc-images
    
    # Exportar frontend
    if [ "$1" == "frontend" ] || [ "$1" == "all" ]; then
        log_info "Exportando frontend..."
        sudo docker save gestion-calidad-frontend:latest | gzip > /tmp/gc-images/frontend.tar.gz
    fi
    
    # Exportar backend
    if [ "$1" == "backend" ] || [ "$1" == "all" ]; then
        log_info "Exportando backend..."
        sudo docker save gestion-calidad-backend:latest | gzip > /tmp/gc-images/backend.tar.gz
    fi
    
    log_info "Imágenes exportadas ✓"
}

# Transferir imágenes al servidor
transfer_images() {
    log_info "Transfiriendo imágenes al servidor..."
    
    if [ "$1" == "frontend" ] || [ "$1" == "all" ]; then
        log_info "Transfiriendo frontend (esto puede tardar unos minutos)..."
        rsync -avz --progress -e "ssh -i $SSH_KEY" \
            /tmp/gc-images/frontend.tar.gz \
            ${SERVER_USER}@${SERVER_IP}:/tmp/
    fi
    
    if [ "$1" == "backend" ] || [ "$1" == "all" ]; then
        log_info "Transfiriendo backend (esto puede tardar unos minutos)..."
        rsync -avz --progress -e "ssh -i $SSH_KEY" \
            /tmp/gc-images/backend.tar.gz \
            ${SERVER_USER}@${SERVER_IP}:/tmp/
    fi
    
    log_info "Transferencia completada ✓"
}

# Cargar imágenes en el servidor y desplegar
deploy_to_server() {
    log_info "Desplegando en servidor..."
    
    ssh -i "$SSH_KEY" ${SERVER_USER}@${SERVER_IP} << EOF
set -e

# Cargar imágenes
if [ "$1" == "frontend" ] || [ "$1" == "all" ]; then
    echo "Cargando frontend image..."
    docker load < /tmp/frontend.tar.gz
    rm /tmp/frontend.tar.gz
fi

if [ "$1" == "backend" ] || [ "$1" == "all" ]; then
    echo "Cargando backend image..."
    docker load < /tmp/backend.tar.gz
    rm /tmp/backend.tar.gz
fi

# Ir al directorio del proyecto
cd ${SERVER_PATH}

# Reiniciar servicios
if [ "$1" == "frontend" ] || [ "$1" == "all" ]; then
    echo "Reiniciando frontend..."
    docker compose up -d frontend
fi

if [ "$1" == "backend" ] || [ "$1" == "all" ]; then
    echo "Reiniciando backend..."
    docker compose up -d backend
fi

# Verificar estado
echo ""
echo "Estado de contenedores:"
docker compose ps

# Limpiar
echo ""
echo "Limpiando imágenes antiguas..."
docker image prune -f
EOF
    
    log_info "Despliegue completado ✓"
}

# Limpiar archivos temporales locales
cleanup() {
    log_info "Limpiando archivos temporales..."
    rm -rf /tmp/gc-images
    log_info "Limpieza completada ✓"
}

# Función principal
main() {
    local component="${1:-all}"
    
    # Validar parámetro
    if [ "$component" != "frontend" ] && [ "$component" != "backend" ] && [ "$component" != "all" ]; then
        log_error "Parámetro inválido. Uso: ./build-and-deploy.sh [frontend|backend|all]"
        exit 1
    fi
    
    log_info "=== Iniciando build y despliegue de: $component ==="
    echo ""
    
    # Verificar Docker
    check_docker
    
    # Build local
    if [ "$component" == "frontend" ] || [ "$component" == "all" ]; then
        build_frontend_local
    fi
    
    if [ "$component" == "backend" ] || [ "$component" == "all" ]; then
        build_backend_local
    fi
    
    # Exportar imágenes
    export_images "$component"
    
    # Transferir al servidor
    transfer_images "$component"
    
    # Desplegar
    deploy_to_server "$component"
    
    # Limpiar
    cleanup
    
    echo ""
    log_info "=== ✓ Proceso completado exitosamente ==="
    log_info "Verifica el estado en: ssh -i $SSH_KEY ${SERVER_USER}@${SERVER_IP} 'cd ${SERVER_PATH} && docker compose ps'"
}

# Ejecutar
main "$@"
