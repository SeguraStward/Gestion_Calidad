# 🚀 Guía de Despliegue a Producción - Gestion Calidad

## 📋 Resumen Ejecutivo

Esta guía documenta el proceso completo para migrar del sistema legacy al nuevo sistema de gestión de calidad en el servidor de producción (138.197.211.207).

---

## 🔍 Situación Actual

### Sistema Legacy (Actualmente en Producción)
- **Ubicación**: `/home/khloe/gestion-calidad-legacy`
- **Puertos ocupados**: 80, 443, 8080
- **Contenedores**:
  - `traefik-proxy` - Reverse proxy principal
  - `gcalidad-legacy-api` - API del sistema antiguo
  - `gcalidad-legacy-client` - Frontend del sistema antiguo
- **Dominios activos**:
  - `gestion-calidad.arayaroma.software`
  - `api.gestion-calidad.arayaroma.software`
- **DNS**: Apunta a IPs de Cloudflare (104.21.88.162, 172.67.186.9)

### Sistema Nuevo (Listo para Despliegue)
- **Ubicación**: `/home/khloe/gestion-calidad`
- **Puertos temporales actuales**: 9080 (HTTP), 9443 (HTTPS)
- **Puertos requeridos**: **80 (HTTP), 443 (HTTPS)** ⚠️ **CRÍTICO PARA SSL**
- **Contenedores**:
  - `traefik` - Reverse proxy con Let's Encrypt
  - `agr-backend` - NestJS API (172.30.0.20:3000)
  - `agr-frontend` - Next.js Frontend (172.30.0.30:3000)
- **Red Docker**: `gcalidad-network` (172.30.0.0/24)

---

## ⚠️ IMPORTANTE: Por Qué Necesitamos el Puerto 80

**Let's Encrypt requiere acceso al puerto 80 estándar para validar el dominio mediante HTTP-01 Challenge:**

1. **Validación de dominio**: Let's Encrypt envía una petición HTTP a `http://tu-dominio.com/.well-known/acme-challenge/TOKEN`
2. **Puerto estándar obligatorio**: La validación DEBE hacerse en el puerto 80 (no funciona en 8080, 9080, etc.)
3. **Sin puerto 80 = Sin certificados SSL** = Sitio web no seguro (navegadores mostrarán advertencia)

**Por lo tanto, es OBLIGATORIO detener el sistema legacy para liberar el puerto 80 antes de desplegar el nuevo sistema.**

---

## 📊 Plan de Migración Recomendado

### Opción A: Migración Directa (Recomendada - Downtime: ~2-5 minutos)

**Ventajas:**
- ✅ Rápida y sencilla
- ✅ Certificados SSL se generan automáticamente
- ✅ No requiere cambios de DNS complejos
- ✅ Downtime mínimo

**Desventajas:**
- ⚠️ Downtime de 2-5 minutos
- ⚠️ No hay posibilidad de rollback inmediato

**Mejor momento:** Horario de baja actividad (madrugada, fin de semana)

---

## 🛠️ Procedimiento de Migración Completo

### **FASE 1: Preparación Pre-Migración** ⏱️ ~10 minutos

#### 1.1 Verificar Estado Actual del Sistema Nuevo
```bash
# Conectar al servidor
ssh -i "/path/to/gcalidad-droplet-key" root@138.197.211.207

# Verificar que el nuevo sistema está corriendo en puertos temporales
cd /home/khloe/gestion-calidad
docker compose ps

# Deberías ver:
# - traefik (Up, puertos 9080:80, 9443:443)
# - agr-backend (Up, puerto 3000)
# - agr-frontend (Up, puerto 3000)
```

#### 1.2 Probar el Sistema Nuevo (CRÍTICO)
```bash
# Test 1: Verificar backend
curl -I http://localhost:9080 -H "Host: api.gestion-calidad.arayaroma.software"
# Esperado: HTTP 308 Redirect a HTTPS

# Test 2: Verificar que los contenedores están saludables
docker logs agr-backend --tail 50
docker logs agr-frontend --tail 50
docker logs traefik --tail 50
```

#### 1.3 Backup del Sistema Legacy (OBLIGATORIO)
```bash
# Exportar configuración del sistema legacy
cd /home/khloe/gestion-calidad-legacy
docker compose config > docker-compose-backup-$(date +%Y%m%d-%H%M%S).yml

# Verificar que existe
ls -lh docker-compose-backup-*.yml
```

#### 1.4 Notificar a Usuarios (Opcional pero Recomendado)
- Enviar email/mensaje avisando del mantenimiento
- Horario recomendado: 2:00 AM - 4:00 AM

---

### **FASE 2: Configuración del Nuevo Sistema** ⏱️ ~5 minutos

#### 2.1 Actualizar docker-compose.yml para Puerto 80/443
```bash
cd /home/khloe/gestion-calidad

# Editar docker-compose.yml
nano docker-compose.yml
```

**Cambiar la sección `proxy` de:**
```yaml
    ports:
      - "9080:80"
      - "9443:443"
```

**A:**
```yaml
    ports:
      - "80:80"
      - "443:443"
```

**Archivo completo debe verse así:**
```yaml
services:
  proxy:
    image: traefik:2.11
    container_name: traefik
    command:
      # Entrypoints
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"

      # Providers
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--providers.file.directory=/etc/traefik/dynamic"
      - "--providers.file.watch=true"

      # Certificate Resolvers
      - "--certificatesresolvers.le.acme.email=stemsrb@una.cr"
      - "--certificatesresolvers.le.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.le.acme.httpchallenge.entrypoint=web"

    ports:
      - "80:80"
      - "443:443"

    networks:
      gcalidad-network:
        ipv4_address: 172.30.0.40

    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik_certs:/letsencrypt
      - ./traefik:/etc/traefik/dynamic:ro
```

#### 2.2 Verificar Configuración de Traefik Dinámico
```bash
# Verificar archivos de configuración de Traefik
ls -la traefik/

# Debería haber archivos como:
# - headers.yml (security headers)
# - redirect.yml (HTTP -> HTTPS redirect)
# - tls.yml (opcional, configuración TLS)

# Verificar contenido de redirect.yml
cat traefik/redirect.yml
```

**Contenido esperado de `traefik/redirect.yml`:**
```yaml
http:
  middlewares:
    redirect-scheme:
      redirectScheme:
        scheme: https
        permanent: true
```

**Contenido esperado de `traefik/headers.yml`:**
```yaml
http:
  middlewares:
    secure-headers:
      headers:
        sslRedirect: true
        forceSTSHeader: true
        stsIncludeSubdomains: true
        stsPreload: true
        stsSeconds: 31536000
```

---

### **FASE 3: Migración en Vivo** ⏱️ ~2-5 minutos

#### 3.1 Detener Sistema Legacy
```bash
# PUNTO DE NO RETORNO - El sitio quedará inaccesible temporalmente
cd /home/khloe/gestion-calidad-legacy
docker compose down

# Verificar que se detuvieron todos los contenedores
docker ps | grep legacy
# No debería mostrar ningún contenedor
```

#### 3.2 Detener Sistema Nuevo (Temporal)
```bash
cd /home/khloe/gestion-calidad
docker compose down
```

#### 3.3 Verificar Puerto 80 Libre
```bash
# Verificar que ningún proceso usa el puerto 80
sudo lsof -i :80
sudo lsof -i :443

# Si aparece algo, identificar y detener:
# sudo kill -9 <PID>

# Verificar docker-proxy
ps aux | grep docker-proxy
# Si hay procesos zombie:
sudo pkill -9 docker-proxy
```

#### 3.4 Levantar Sistema Nuevo en Puerto 80/443
```bash
cd /home/khloe/gestion-calidad

# Levantar servicios
docker compose up -d

# Verificar estado (debe tardar ~30 segundos en estar listo)
docker compose ps

# Deberías ver:
# NAME         STATUS       PORTS
# traefik      Up X seconds 0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
# agr-backend  Up X seconds 3000/tcp
# agr-frontend Up X seconds 3000/tcp
```

#### 3.5 Verificar Logs en Tiempo Real
```bash
# Ver logs de Traefik (CTRL+C para salir)
docker logs -f traefik

# Buscar líneas como:
# - "Configuration loaded from flags"
# - "Server configuration reloaded"
# - Errores ACME (normales al principio, se resolverán con DNS)
```

---

### **FASE 4: Validación y Pruebas** ⏱️ ~10-15 minutos

#### 4.1 Pruebas Locales (Desde el Servidor)
```bash
# Test 1: Traefik responde en puerto 80
curl -I http://localhost
# Esperado: HTTP/1.1 404 Not Found (normal sin dominio correcto)

# Test 2: Backend con header de dominio
curl -I -H "Host: api.gestion-calidad.arayaroma.software" http://localhost/api/v1/auth/me
# Esperado: HTTP 308 Redirect a HTTPS

# Test 3: Frontend con header de dominio
curl -I -H "Host: gestion-calidad.arayaroma.software" http://localhost/
# Esperado: HTTP 308 Redirect a HTTPS

# Test 4: Verificar conectividad de contenedores
docker exec agr-backend curl -I http://172.30.0.30:3000
# Esperado: HTTP 200 OK (frontend responde)

docker exec agr-frontend curl -I http://172.30.0.20:3000/api/v1/auth/me
# Esperado: HTTP 401 Unauthorized (backend responde, sin auth)
```

#### 4.2 Actualizar DNS (SI ES NECESARIO)

**⚠️ IMPORTANTE:** Si el DNS actualmente apunta a Cloudflare (proxy), necesitas cambiarlo a la IP del servidor.

```bash
# Verificar DNS actual
dig gestion-calidad.arayaroma.software +short
dig api.gestion-calidad.arayaroma.software +short

# Si muestra IPs de Cloudflare (104.21.x.x, 172.67.x.x):
# 1. Ir a panel de Cloudflare
# 2. Encontrar registros DNS:
#    - gestion-calidad.arayaroma.software
#    - api.gestion-calidad.arayaroma.software
# 3. Cambiar a:
#    - Tipo: A
#    - Valor: 138.197.211.207
#    - Proxy: OFF (desactivar proxy naranja)
# 4. TTL: 5 minutos (para propagación rápida)

# Esperar propagación DNS (5-10 minutos)
watch -n 10 'dig gestion-calidad.arayaroma.software +short'
```

#### 4.3 Esperar Generación de Certificados SSL

```bash
# Monitorear logs de Traefik para ver generación de certificados
docker logs -f traefik | grep -i acme

# Verás líneas como:
# - "Waiting for new ACME challenge"
# - "validating challenge"
# - "Certificate obtained for gestion-calidad.arayaroma.software"

# Puede tardar 1-5 minutos por dominio
# Let's Encrypt validará:
# 1. http://gestion-calidad.arayaroma.software/.well-known/acme-challenge/TOKEN
# 2. http://api.gestion-calidad.arayaroma.software/.well-known/acme-challenge/TOKEN

# Verificar certificados generados
docker exec traefik ls -la /letsencrypt/
# Debe existir acme.json con permisos 600
```

#### 4.4 Pruebas Externas (Desde tu Computadora Local)

```bash
# Test 1: HTTP redirige a HTTPS
curl -I http://gestion-calidad.arayaroma.software
# Esperado: HTTP 308 Permanent Redirect
# Location: https://gestion-calidad.arayaroma.software/

# Test 2: HTTPS funciona con certificado válido
curl -I https://gestion-calidad.arayaroma.software
# Esperado: HTTP 200 OK

# Test 3: Verificar certificado SSL
curl -vI https://gestion-calidad.arayaroma.software 2>&1 | grep -i "issuer"
# Esperado: issuer: C=US; O=Let's Encrypt; CN=R3 o R10 o R11

# Test 4: Backend API
curl -I https://api.gestion-calidad.arayaroma.software/api/v1/auth/me
# Esperado: HTTP 401 Unauthorized (correcto, requiere autenticación)

# Test 5: Probar en navegador
# Abrir: https://gestion-calidad.arayaroma.software
# Debe cargar el login sin advertencias de seguridad
```

#### 4.5 Pruebas Funcionales

1. **Login con Google OAuth**
   - Ir a `https://gestion-calidad.arayaroma.software`
   - Click en "Iniciar Sesión con Google"
   - Verificar redirección correcta
   - Confirmar login exitoso

2. **Navegación**
   - Dashboard principal
   - Gestión SINAES
   - Reportes finales
   - Gestión de usuarios

3. **API Backend**
   ```bash
   # Test con token (obtener después de login)
   curl -H "Authorization: Bearer <TOKEN>" \
        https://api.gestion-calidad.arayaroma.software/api/v1/auth/me
   # Esperado: JSON con datos de usuario
   ```

---

### **FASE 5: Monitoreo Post-Despliegue** ⏱️ Primeras 24 horas

#### 5.1 Monitoreo Continuo
```bash
# Ver logs en tiempo real
docker compose logs -f --tail=100

# Monitorear recursos
docker stats

# Ver estado de contenedores cada 5 segundos
watch -n 5 'docker compose ps'
```

#### 5.2 Verificar Logs de Errores
```bash
# Errores de backend
docker logs agr-backend | grep -i error

# Errores de frontend  
docker logs agr-frontend | grep -i error

# Errores de Traefik
docker logs traefik | grep -i error
```

#### 5.3 Verificar Renovación de Certificados

Los certificados de Let's Encrypt duran **90 días**. Traefik los renovará automáticamente a los 30 días antes del vencimiento.

```bash
# Verificar fecha de expiración de certificados
echo | openssl s_client -servername gestion-calidad.arayaroma.software \
  -connect gestion-calidad.arayaroma.software:443 2>/dev/null | \
  openssl x509 -noout -dates

# Debe mostrar:
# notBefore=<fecha actual>
# notAfter=<fecha actual + 90 días>
```

---

## 🔄 Plan de Rollback (Si Algo Sale Mal)

### Rollback Inmediato (Dentro de los primeros 10 minutos)

```bash
# 1. Detener sistema nuevo
cd /home/khloe/gestion-calidad
docker compose down

# 2. Levantar sistema legacy
cd /home/khloe/gestion-calidad-legacy
docker compose up -d

# 3. Verificar
docker compose ps
curl -I http://localhost

# 4. Esperar ~2 minutos para que esté operativo
```

### Rollback Tardío (Después de varias horas)

Si el sistema nuevo estuvo funcionando pero necesitas volver:

```bash
# 1. Notificar a usuarios
# 2. Detener nuevo sistema
cd /home/khloe/gestion-calidad
docker compose down

# 3. Restaurar legacy
cd /home/khloe/gestion-calidad-legacy
docker compose up -d

# 4. IMPORTANTE: Limpiar certificados de Let's Encrypt del nuevo sistema
#    para evitar rate limits
cd /home/khloe/gestion-calidad
docker volume rm gestion-calidad_traefik_certs
# o
sudo rm -rf /var/lib/docker/volumes/gestion-calidad_traefik_certs/_data/*

# 5. Verificar DNS si se cambió
```

---

## 📝 Checklist Pre-Despliegue

Antes de ejecutar la migración, verifica:

- [ ] Sistema nuevo funciona correctamente en puertos 9080/9443
- [ ] Backup del sistema legacy realizado
- [ ] Archivo `docker-compose.yml` actualizado con puertos 80/443
- [ ] Archivos de configuración de Traefik verificados (`traefik/*.yml`)
- [ ] Variables de entorno configuradas (`.env` files)
- [ ] Acceso SSH al servidor confirmado
- [ ] Usuarios notificados del mantenimiento (si aplica)
- [ ] Plan de rollback revisado y entendido
- [ ] Horario de baja actividad seleccionado
- [ ] Persona de contacto disponible durante el despliegue

---

## 🆘 Solución de Problemas Comunes

### Problema 1: Certificados SSL No Se Generan

**Síntomas:**
```
Unable to obtain ACME certificate for domains
error: 403 :: urn:ietf:params:acme:error:unauthorized
```

**Causas:**
- DNS no apunta a la IP correcta del servidor
- Puerto 80 no está accesible externamente
- Firewall bloqueando tráfico

**Solución:**
```bash
# Verificar DNS
dig gestion-calidad.arayaroma.software +short
# Debe mostrar: 138.197.211.207

# Verificar puerto 80 desde internet
curl -I http://138.197.211.207
# Debe responder (aunque sea 404)

# Verificar firewall
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Problema 2: Contenedores No Pueden Comunicarse

**Síntomas:**
- Frontend no puede llamar al backend
- Error de conexión en navegador

**Solución:**
```bash
# Verificar red Docker
docker network ls | grep gcalidad
docker network inspect gestion-calidad_gcalidad-network

# Recrear red si es necesario
docker compose down
docker network rm gestion-calidad_gcalidad-network
docker compose up -d

# Verificar IPs asignadas
docker inspect agr-backend | grep IPAddress
docker inspect agr-frontend | grep IPAddress
# Deben estar en 172.30.0.x
```

### Problema 3: Puerto 80 Aún Ocupado

**Síntomas:**
```
Bind for 0.0.0.0:80 failed: port is already allocated
```

**Solución:**
```bash
# Identificar proceso
sudo lsof -i :80
sudo netstat -tulpn | grep :80

# Si es docker-proxy zombie
sudo pkill -9 docker-proxy

# Si es nginx u otro servicio
sudo systemctl stop nginx
# o
sudo systemctl stop apache2

# Reintentar
docker compose up -d
```

### Problema 4: Error 502 Bad Gateway

**Síntomas:**
- Traefik responde pero muestra 502
- Backend/Frontend no responden

**Solución:**
```bash
# Verificar estado de contenedores
docker compose ps
# Todos deben estar "Up"

# Ver logs de servicios
docker logs agr-backend --tail 100
docker logs agr-frontend --tail 100

# Verificar conectividad interna
docker exec traefik ping -c 3 agr-backend
docker exec traefik ping -c 3 agr-frontend

# Reiniciar servicios problemáticos
docker compose restart backend
docker compose restart frontend
```

---

## 📊 Métricas de Éxito

Después de la migración, el sistema debe cumplir:

✅ **Disponibilidad:**
- Sitio accesible en `https://gestion-calidad.arayaroma.software`
- API accesible en `https://api.gestion-calidad.arayaroma.software`
- Sin advertencias de seguridad en navegadores

✅ **Seguridad:**
- Certificados SSL válidos de Let's Encrypt
- Headers de seguridad configurados
- HTTP redirige automáticamente a HTTPS

✅ **Funcionalidad:**
- Login con Google OAuth funciona
- Backend responde correctamente
- Frontend carga sin errores
- Navegación fluida entre páginas

✅ **Rendimiento:**
- Tiempo de carga < 3 segundos
- API responde en < 500ms
- Sin errores en logs

---

## 📞 Contacto y Soporte

**En caso de problemas críticos:**

1. **Rollback inmediato** (ver sección de Rollback)
2. Revisar logs: `docker logs <container>`
3. Consultar esta guía en sección de troubleshooting
4. Documentar el error para análisis posterior

---

## 📅 Calendario de Mantenimiento

**Renovación de Certificados SSL:**
- Automática cada 60 días (Traefik lo hace solo)
- Verificar manualmente cada trimestre

**Actualizaciones de Imágenes Docker:**
- Revisar actualizaciones de Traefik cada 6 meses
- Actualizar backend/frontend según roadmap de desarrollo

**Backups:**
- Backup de base de datos: diario (externo a este sistema)
- Backup de configuración Docker: mensual
- Backup de certificados SSL: semanal

---

## 🎯 Resumen Ejecutivo de Comandos

```bash
# ============================================
# MIGRACIÓN RÁPIDA (Copiar y ejecutar)
# ============================================

# 1. Conectar al servidor
ssh -i "/path/to/key" root@138.197.211.207

# 2. Backup legacy
cd /home/khloe/gestion-calidad-legacy
docker compose config > backup-$(date +%Y%m%d-%H%M%S).yml

# 3. Detener legacy
docker compose down

# 4. Actualizar nuevo sistema
cd /home/khloe/gestion-calidad
# Editar docker-compose.yml: cambiar puertos a 80:80 y 443:443
nano docker-compose.yml

# 5. Reiniciar con puertos correctos
docker compose down
docker compose up -d

# 6. Verificar
docker compose ps
docker logs -f traefik

# 7. Esperar certificados SSL (5-10 min)
# 8. Probar: https://gestion-calidad.arayaroma.software
```

---

## ✅ Conclusión

Siguiendo esta guía paso a paso, podrás migrar exitosamente el sistema de gestión de calidad del legacy al nuevo sistema con downtime mínimo y riesgo controlado.

**Tiempo total estimado:** 30-45 minutos  
**Downtime estimado:** 2-5 minutos  
**Nivel de dificultad:** Medio

**¡Buena suerte con el despliegue! 🚀**
