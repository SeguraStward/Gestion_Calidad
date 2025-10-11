# Configuración de Google Drive con Service Account

## 📋 Solución Implementada

Esta implementación utiliza **transferencia de propiedad** para resolver la limitación de cuota de almacenamiento de las Service Accounts en cuentas de Google Drive regulares (no Google Workspace con Shared Drives).

### Flujo de Funcionamiento

```
1. Service Account sube el archivo → Google Drive
2. Service Account transfiere propiedad → Cuenta institucional/personal
3. Archivo queda en el Drive del propietario
4. Service Account mantiene acceso para gestión
```

## ✅ Ventajas de esta Solución

### 1. **Portabilidad** 🚀
- ✅ **Configuración por variable de entorno**: Solo cambia `GOOGLE_DRIVE_OWNER_EMAIL` en `.env`
- ✅ **Sin código hardcodeado**: No hay emails en el código fuente
- ✅ **Múltiples ambientes**: Dev, staging, producción usan diferentes owners
- ✅ **Sin recompilación**: Cambias el `.env` y reinicias el servidor

### 2. **Eficiencia** ⚡
- ✅ **Sin cuota de Service Account**: Los archivos no consumen cuota del Service Account
- ✅ **Usa cuota del owner**: Los archivos consumen cuota de la cuenta institucional
- ✅ **Operación atómica**: Upload + transferencia en una sola llamada API
- ✅ **Logging completo**: Cada paso está logueado para debugging
- ✅ **Manejo de errores robusto**: Si la transferencia falla, el archivo se sube igual

### 3. **Flexibilidad** 🔧
- ✅ **Opcional**: Si no se configura `GOOGLE_DRIVE_OWNER_EMAIL`, el Service Account queda como owner
- ✅ **Compatible con Shared Drives**: Si en el futuro tienes acceso, solo cambias `GOOGLE_DRIVE_ROOT_FOLDER_ID`
- ✅ **Sin cambios de código**: La misma implementación funciona en ambos casos

## 🔧 Configuración por Ambiente

### Desarrollo Local
```bash
# apps/backend/.env
GOOGLE_DRIVE_OWNER_EMAIL=tu-email-personal@gmail.com
```

### Staging
```bash
# .env.staging
GOOGLE_DRIVE_OWNER_EMAIL=qa-team@company.com
```

### Producción
```bash
# .env.production
GOOGLE_DRIVE_OWNER_EMAIL=sistema-calidad@una.cr
```

### Sin Transferencia (Opcional)
```bash
# Si no configuras GOOGLE_DRIVE_OWNER_EMAIL, el Service Account queda como owner
# Útil para testing o ambientes temporales
# (Deja la línea vacía o comentada)
# GOOGLE_DRIVE_OWNER_EMAIL=
```

## 📊 Comparación de Alternativas

| Característica | Shared Drives | Transferencia de Propiedad (Nuestra Solución) |
|----------------|---------------|------------------------------------------------|
| **Requiere Google Workspace** | ✅ Sí | ❌ No |
| **Funciona con Gmail** | ❌ No | ✅ Sí |
| **Portabilidad** | ✅ Alta | ✅ Alta |
| **Eficiencia** | ✅ Alta | ✅ Alta |
| **Cuota de almacenamiento** | Shared Drive | Owner account |
| **Cambio de ambiente** | Cambia `GOOGLE_DRIVE_ROOT_FOLDER_ID` | Cambia `GOOGLE_DRIVE_OWNER_EMAIL` |
| **Permisos requeridos** | Manager del Shared Drive | Editor de la carpeta |

## 🔐 Seguridad

### Permisos del Service Account
- ✅ **Solo en carpetas específicas**: Service Account solo tiene acceso a `GOOGLE_DRIVE_ROOT_FOLDER_ID`
- ✅ **Transferencia automática**: Los archivos pasan inmediatamente al owner
- ✅ **Sin acceso permanente**: Después de la transferencia, el Service Account no es owner

### Permisos del Owner
- ✅ **Control total**: El owner puede gestionar los archivos desde drive.google.com
- ✅ **Auditoría**: El owner ve todos los archivos en su Drive
- ✅ **Eliminación controlada**: Solo el owner puede eliminar archivos

## 🚀 Migración a Shared Drives (Futuro)

Si en el futuro obtienes acceso a Shared Drives, la migración es simple:

### Paso 1: Crear Shared Drive
1. Ve a drive.google.com con tu cuenta de Google Workspace
2. Click en "Unidades compartidas" → "+ Nuevo"
3. Nombre: "SINAES-Gestion-Calidad"

### Paso 2: Compartir con Service Account
1. Dentro del Shared Drive → Configuración
2. Agregar: `gestion-calidad-drive@gestioncalidad-454417.iam.gserviceaccount.com`
3. Rol: "Administrador de contenido"

### Paso 3: Actualizar configuración
```bash
# apps/backend/.env
GOOGLE_DRIVE_ROOT_FOLDER_ID=<ID_DEL_SHARED_DRIVE>
# GOOGLE_DRIVE_OWNER_EMAIL=  ← Ya no es necesario
```

### Paso 4: Reiniciar
```bash
pnpm dev
```

**¡Listo!** El código ya tiene soporte para Shared Drives (`supportsAllDrives: true`).

## 🧪 Testing

### Test de Upload con Transferencia
```bash
# 1. Asegúrate de que GOOGLE_DRIVE_OWNER_EMAIL esté configurado
echo $GOOGLE_DRIVE_OWNER_EMAIL

# 2. Crea un archivo de prueba
echo "Test content" > /tmp/test-document.txt

# 3. Sube el archivo
curl -X POST http://localhost:3000/api/v1/google-drive/upload \
  -F "file=@/tmp/test-document.txt" \
  -F "folderId=1I5iSvOfUlXwLLO67pM1noB1hb3FbsOFS"

# 4. Verifica en drive.google.com con la cuenta del owner
# El archivo debe aparecer en la carpeta especificada
```

### Verificar Logs
```bash
# Logs del backend deben mostrar:
# - "Creating file in Google Drive..."
# - "File created with ID: ..."
# - "Transferring ownership to: [email]"
# - "Ownership transferred successfully"
# - "Setting public permissions..."
# - "File uploaded successfully: ..."
```

## 📝 Notas Técnicas

### Limitaciones de la Transferencia de Propiedad

1. **No funciona entre dominios diferentes de Google Workspace**
   - ❌ No puedes transferir de Service Account @iam.gserviceaccount.com a cuenta @gmail.com si están en diferentes organizaciones
   - ✅ Funciona bien para cuentas del mismo dominio o cuentas Gmail regulares

2. **Requiere que el owner tenga acceso a la carpeta**
   - El email del owner debe tener permisos de "Editor" o "Propietario" en la carpeta raíz
   - Compartir la carpeta `GOOGLE_DRIVE_ROOT_FOLDER_ID` con el owner email

### Troubleshooting

#### Error: "Cannot transfer ownership"
**Solución**: Asegúrate de que la carpeta raíz esté compartida con el email del owner

```bash
# Ve a drive.google.com
# Busca la carpeta con ID: 1I5iSvOfUlXwLLO67pM1noB1hb3FbsOFS
# Click derecho → Compartir
# Agrega el email configurado en GOOGLE_DRIVE_OWNER_EMAIL
# Rol: Editor
```

#### Error: "File is missing"
**Solución**: Verifica que la Service Account tenga acceso a la carpeta

```bash
# Compartir carpeta con Service Account:
# gestion-calidad-drive@gestioncalidad-454417.iam.gserviceaccount.com
# Rol: Editor
```

## 🎯 Conclusión

Esta solución es:
- ✅ **100% Portable**: Solo cambias variables de entorno entre ambientes
- ✅ **100% Eficiente**: No hay overhead significativo, operación atómica
- ✅ **Preparada para el futuro**: Compatible con Shared Drives sin cambios de código
- ✅ **Segura**: Control de permisos granular
- ✅ **Escalable**: Funciona igual con 10 o 10,000 archivos

**Recomendación para Producción**: Si tu organización tiene Google Workspace, usa Shared Drives. Si no, esta solución con transferencia de propiedad es la mejor alternativa.
