# Script de Build y Despliegue Rápido

## 📋 Descripción

Script automatizado para hacer build de las imágenes Docker localmente y desplegarlas rápidamente al servidor de producción.

**Ventajas:**
- ✅ Build local más rápido (usa recursos de tu máquina)
- ✅ Transferencia de imágenes ya compiladas (evita compilar en el servidor)
- ✅ Despliegue automático y reinicio de servicios
- ✅ Limpieza automática de archivos temporales

## 🚀 Uso

```bash
# Build y deploy de todo (frontend + backend)
./build-and-deploy.sh all

# Solo frontend
./build-and-deploy.sh frontend

# Solo backend
./build-and-deploy.sh backend
```

## 📦 Qué hace el script

1. **Verifica Docker** - Confirma que Docker esté corriendo localmente
2. **Build Local** - Compila las imágenes Docker en tu máquina
3. **Exporta Imágenes** - Guarda las imágenes como archivos .tar.gz
4. **Transfiere** - Envía las imágenes al servidor vía rsync
5. **Carga en Servidor** - Importa las imágenes en Docker del servidor
6. **Despliega** - Reinicia los servicios con `docker compose up -d`
7. **Limpia** - Elimina archivos temporales y imágenes antiguas

## ⏱️ Tiempos Estimados

- **Frontend:** ~5-7 minutos (build local + transfer + deploy)
- **Backend:** ~3-4 minutos (build local + transfer + deploy)
- **All:** ~8-10 minutos total

## 📝 Notas Importantes

### Antes de ejecutar:
1. Asegúrate de tener Docker corriendo localmente
2. Verifica que tienes espacio suficiente (mínimo 2GB libre)
3. Los archivos `.env` deben estar configurados correctamente

### Variables de entorno:
El script usa los archivos `.env` que ya están en el directorio del proyecto:
- `apps/frontend/.env` → Variables de frontend
- `apps/backend/.env` → Variables de backend

### Si necesitas cambiar variables:
```bash
# 1. Edita el archivo localmente
nano apps/frontend/.env

# 2. Copia al servidor
rsync -avz -e "ssh -i /home/segurastward/Documents/ssh/gcalidad-ssh-keys/home/khl0e/.ssh/gcalidad/gcalidad-droplet-key" \
  apps/frontend/.env root@138.197.211.207:/home/khloe/gestion-calidad/apps/frontend/.env

# 3. Ejecuta el script
./build-and-deploy.sh frontend
```

## 🐛 Troubleshooting

### Error: "Docker no está corriendo"
```bash
sudo systemctl start docker
```

### Error: "No space left on device"
```bash
# Limpiar imágenes locales
docker system prune -a

# Limpiar en servidor
ssh -i "/home/segurastward/Documents/ssh/gcalidad-ssh-keys/home/khl0e/.ssh/gcalidad/gcalidad-droplet-key" \
  root@138.197.211.207 'docker system prune -a -f'
```

### Ver logs después del despliegue:
```bash
# Frontend
ssh -i "/home/segurastward/Documents/ssh/gcalidad-ssh-keys/home/khl0e/.ssh/gcalidad/gcalidad-droplet-key" \
  root@138.197.211.207 'cd /home/khloe/gestion-calidad && docker logs agr-frontend -f'

# Backend
ssh -i "/home/segurastward/Documents/ssh/gcalidad-ssh-keys/home/khl0e/.ssh/gcalidad/gcalidad-droplet-key" \
  root@138.197.211.207 'cd /home/khloe/gestion-calidad && docker logs agr-backend -f'
```

## 🔄 Workflow Recomendado

1. **Desarrollo local** - Haz tus cambios en el código
2. **Commit** - Guarda tus cambios en Git
3. **Build y Deploy** - Ejecuta `./build-and-deploy.sh [component]`
4. **Verifica** - Revisa los logs y prueba la aplicación
5. **Cloudflare** - Si es necesario, limpia el cache de Cloudflare

## ⚙️ Configuración

Si necesitas modificar rutas o configuración, edita las variables al inicio del script:

```bash
SERVER_USER="root"
SERVER_IP="138.197.211.207"
SSH_KEY="/home/segurastward/Documents/ssh/gcalidad-ssh-keys/home/khl0e/.ssh/gcalidad/gcalidad-droplet-key"
SERVER_PATH="/home/khloe/gestion-calidad"
LOCAL_PATH="/home/segurastward/Documents/Projects/gestion-calidad"
```

## 🎯 Casos de Uso

### Arreglar error en producción rápidamente:
```bash
# 1. Corrige el código localmente
# 2. Deploy inmediato
./build-and-deploy.sh frontend  # o backend según sea necesario
```

### Deploy completo después de muchos cambios:
```bash
./build-and-deploy.sh all
```

### Testing iterativo:
```bash
# Ciclo: editar → deploy → probar
./build-and-deploy.sh frontend
# Ver logs y probar
# Repetir...
```
