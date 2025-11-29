# Solución Google Drive con OAuth2 del Usuario Admin

## 🎯 **Resumen de la Solución**

Esta implementación permite que el **usuario admin autenticado** use **su propio Google Drive personal** para almacenar los archivos del módulo SINAES, eliminando completamente la necesidad de Service Accounts, Shared Drives o Domain-Wide Delegation.

---

## ✅ **Ventajas de esta Solución**

### 1. **Simplicidad Total** 🚀
- ✅ No requiere Shared Drives (permisos de administrador)
- ✅ No requiere Service Account
- ✅ No requiere Domain-Wide Delegation
- ✅ Usa la autenticación OAuth2 que ya tienes implementada

### 2. **Portabilidad** 📦
- ✅ Si cambia el admin, solo necesita loguearse con Google
- ✅ Las carpetas se crean automáticamente en su Drive personal
- ✅ Cada admin tiene su propio espacio organizado

### 3. **Sin Cuotas** 💾
- ✅ Usa la cuota del Drive personal del admin (15GB gratis)
- ✅ Si el admin tiene Google Workspace, usa la cuota institucional
- ✅ No hay problemas de "Service Account sin cuota"

### 4. **Seguridad** 🔐
- ✅ Solo usuarios autenticados pueden usar Google Drive
- ✅ Los archivos están en el Drive del usuario responsable
- ✅ Control total desde drive.google.com

---

## 🔧 **Cómo Funciona**

### **Flujo Completo:**

```
1. Usuario admin se loguea con Google OAuth2
   ↓
2. Backend solicita permisos de Google Drive
   ↓
3. Usuario acepta (solo la primera vez)
   ↓
4. Backend guarda accessToken y refreshToken
   ↓
5. Al subir archivo:
   - Backend usa el accessToken del usuario
   - Archivo se sube al Drive personal del usuario
   - Se crea carpeta raíz "SINAES - Gestión de Calidad" si no existe
   ↓
6. Usuario puede ver/gestionar archivos en drive.google.com
```

---

## 📋 **Cambios Implementados**

### **1. Google Strategy (`google-strategy.ts`)**

**Antes:**
```typescript
scope: ['email', 'profile'],
```

**Después:**
```typescript
scope: [
  'email',
  'profile',
  'https://www.googleapis.com/auth/drive.file' // Permiso para crear/modificar archivos
],
accessType: 'offline', // Obtener refresh token
prompt: 'consent', // Forzar pantalla de consentimiento
```

### **2. Google Drive Service (`google-drive.service.ts`)**

#### **Nuevo método: `createDriveClient()`**
Crea un cliente de Google Drive usando los tokens OAuth2 del usuario:
```typescript
private createDriveClient(accessToken: string, refreshToken?: string): drive_v3.Drive {
  const oauth2Client = new OAuth2Client(clientId, clientSecret)
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })
  return new drive_v3.Drive({ auth: oauth2Client })
}
```

#### **Nuevo método: `ensureRootFolder()`**
Crea automáticamente la carpeta raíz "SINAES - Gestión de Calidad" en el Drive del usuario:
```typescript
private async ensureRootFolder(userDrive: drive_v3.Drive): Promise<string> {
  // Busca carpeta existente o la crea
  // Retorna el ID de la carpeta raíz
}
```

#### **Métodos actualizados:**
- `createFolderStructure(structure, accessToken)` - Ahora recibe el token del usuario
- `uploadFile(file, folderId, accessToken)` - Ahora recibe el token del usuario
- `ensureFolderWithClient(userDrive, ...)` - Usa el Drive client del usuario

### **3. Google Drive Controller (`google-drive.controller.ts`)**

Ahora extrae el `googleAccessToken` del usuario autenticado:

```typescript
@Post('upload')
async uploadFile(
  @UploadedFile() file: any,
  @Body('folderId') folderId: string,
  @Req() request: Request
): Promise<any> {
  // Obtiene el usuario autenticado
  const user = (request as any).user
  
  // Verifica que tenga token de Google
  if (!user?.googleAccessToken) {
    throw new UnauthorizedException('User must be authenticated with Google')
  }
  
  // Usa el token del usuario
  return this.googleDriveService.uploadFile(file, folderId, user.googleAccessToken)
}
```

---

## 🚀 **Cómo Probarlo**

### **Paso 1: Cerrar sesión y volver a loguearse**

El usuario admin debe volver a autenticarse para que Google pida los nuevos permisos de Drive:

```bash
# Frontend
# 1. Cerrar sesión
# 2. Click en "Iniciar sesión con Google"
# 3. Aceptar los nuevos permisos (verás "Ver y gestionar archivos de Google Drive")
```

### **Paso 2: Reiniciar el backend**

```bash
cd /home/segurastward/Documents/Projects/gestion-calidad
pnpm dev
```

### **Paso 3: Probar crear estructura de carpetas**

**Desde el frontend autenticado:**
```javascript
// El frontend debe incluir el token de autenticación (cookie/header)
fetch('/api/v1/google-drive/create-structure', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // El token se envía automáticamente en la cookie
  },
  body: JSON.stringify({
    dimensionCode: 'DIM01',
    dimensionName: 'Dimensión de Prueba',
    componentCode: 'COMP01',
    componentName: 'Componente de Prueba',
    // ... resto de datos
  })
})
```

### **Paso 4: Probar upload**

```javascript
const formData = new FormData()
formData.append('file', fileInput.files[0])
formData.append('folderId', 'ID_DE_LA_CARPETA')

fetch('/api/v1/google-drive/upload', {
  method: 'POST',
  body: formData,
  // Cookies se envían automáticamente
})
```

### **Paso 5: Verificar en Google Drive**

1. Ve a [drive.google.com](https://drive.google.com)
2. Deberías ver una carpeta **"SINAES - Gestión de Calidad"**
3. Dentro estarán todas las subcarpetas y archivos

---

## 📊 **Comparación de Soluciones**

| Característica | Service Account | Shared Drives | **OAuth2 Usuario (Nuestra Solución)** |
|----------------|-----------------|---------------|---------------------------------------|
| **Requiere permisos admin** | ❌ No | ✅ Sí | ❌ No |
| **Funciona con Gmail** | ❌ No (sin cuota) | ❌ No | ✅ Sí |
| **Funciona con Google Workspace** | ⚠️ Con Domain-Wide | ✅ Sí | ✅ Sí |
| **Simplicidad** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Portabilidad** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Cuota de almacenamiento** | ❌ Sin cuota | Shared Drive | Drive del usuario |
| **Cambio de responsable** | Actualizar .env | Compartir Drive | Re-loguearse |

---

## 🔐 **Seguridad y Permisos**

### **Permisos Solicitados:**
- ✅ `email` - Email del usuario
- ✅ `profile` - Nombre y foto
- ✅ `https://www.googleapis.com/auth/drive.file` - **Solo** archivos creados por la app

**Nota importante:** El permiso `drive.file` solo da acceso a archivos/carpetas creados por la aplicación, NO a todo el Drive del usuario.

### **Tokens almacenados:**
- `accessToken` - Válido por 1 hora, se usa para las operaciones
- `refreshToken` - Válido indefinidamente, se usa para renovar el accessToken

### **Recomendación:**
Guardar estos tokens en la base de datos encriptados:
```typescript
// En el modelo User (Prisma/MongoDB)
{
  googleAccessToken: String, // Encriptado
  googleRefreshToken: String, // Encriptado
  googleTokenExpiry: Date
}
```

---

## 🎯 **Ventajas para Producción**

### **Si cambia el admin:**

**Opción A: Transferir archivos**
```
1. Nuevo admin se loguea
2. Carpetas se crean en su Drive
3. Antiguo admin comparte carpeta "SINAES" con nuevo admin
4. Nuevo admin mueve archivos a su carpeta
```

**Opción B: Shared folder**
```
1. Antiguo admin comparte carpeta "SINAES" con nuevo admin
2. Nuevo admin se loguea
3. App detecta carpeta compartida y la usa
```

**Opción C: Backup/Restore**
```
1. Exportar archivos del Drive del antiguo admin
2. Nuevo admin se loguea
3. Importar archivos a su Drive
```

---

## ✅ **Checklist de Implementación**

- [x] Actualizar `google-strategy.ts` con scope de Drive
- [x] Actualizar `GoogleDriveService` para usar OAuth2 del usuario
- [x] Actualizar `GoogleDriveController` para extraer accessToken
- [ ] **Actualizar frontend**: Re-autenticarse para obtener nuevos permisos
- [ ] **Actualizar modelo User**: Guardar tokens en DB (opcional pero recomendado)
- [ ] **Implementar refresh token**: Auto-renovar accessToken cuando expire
- [ ] **Probar flujo completo**: Crear carpetas y subir archivos

---

## 📝 **Próximos Pasos**

### **1. Guardar tokens en DB (Recomendado)**

Actualizar el modelo User para persistir los tokens:

```prisma
model User {
  id                  String    @id @default(auto()) @map("_id") @db.ObjectId
  email               String    @unique
  // ... otros campos
  googleAccessToken   String?   // Encriptado
  googleRefreshToken  String?   // Encriptado
  googleTokenExpiry   DateTime?
}
```

### **2. Implementar renovación automática de tokens**

Crear un método en `GoogleDriveService`:
```typescript
private async refreshAccessToken(refreshToken: string): Promise<string> {
  // Usar refreshToken para obtener nuevo accessToken
  // Actualizar en DB
}
```

### **3. Agregar verificación de permisos**

Antes de usar Drive, verificar que el usuario tenga el rol de admin:
```typescript
if (!user.roles.includes('admin')) {
  throw new ForbiddenException('Only admins can manage SINAES files')
}
```

---

## 🎉 **Conclusión**

Esta es la solución más simple, portable y funcional para tu caso de uso:

✅ **Sin Service Accounts** - No más problemas de cuota
✅ **Sin Shared Drives** - No requiere permisos especiales
✅ **Sin Domain-Wide Delegation** - No requiere admin de Google Workspace
✅ **100% OAuth2** - Usa autenticación estándar de Google
✅ **Portable** - Funcional en cualquier ambiente (dev/staging/prod)
✅ **Escalable** - Si necesitas múltiples admins, solo se loguean

**Resultado:** Archivos en el Drive personal del admin con control total desde drive.google.com 🚀
