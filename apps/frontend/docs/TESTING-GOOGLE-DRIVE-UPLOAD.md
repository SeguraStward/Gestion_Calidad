# Guía Rápida: Probar Subida de Archivos a Google Drive

## Requisitos Previos

1. ✅ Backend corriendo en `http://localhost:3001`
2. ✅ Frontend corriendo en `http://localhost:3000`
3. ✅ Variables de entorno configuradas (Google Client ID y Secret)
4. ✅ Usuario con rol 'admin' en el sistema

## Pasos para Probar

### 1. Autenticarse con Google (Primera Vez)

1. **Cerrar sesión** si ya estás autenticado
2. **Iniciar sesión** usando el botón "Login with Google"
3. **Aceptar permisos** cuando Google solicite:
   - Ver información de tu cuenta
   - Ver y gestionar archivos de Google Drive creados por esta app
4. Sistema te redirigirá automáticamente

### 2. Verificar Rol de Admin

En la interfaz deberías ver tu rol actual. Si no eres admin:
- Solicita a un administrador que te asigne el rol 'admin'
- O asígnate el rol manualmente en la base de datos (desarrollo)

### 3. Navegar al Módulo SINAES

1. Ir a **Gestión SINAES** en el menú principal
2. Navegar por la jerarquía:
   - Seleccionar **Dimensión** (ej: "DIM01 - Gestión Institucional")
   - Seleccionar **Componente** (ej: "COMP01 - Planificación Estratégica")
   - Seleccionar **Criterio**
   - Seleccionar **Estándar**
   - Seleccionar **Evidencia**

### 4. Subir Documento

1. Ir a la pestaña **"Documentos Probatorios"** o **"Upload"**
2. Completar el formulario:
   - **Nombre del documento**: "Convenio de Colaboración"
   - **Tipo de documento**: Seleccionar uno de la lista
   - **Evidencia**: Debería estar pre-seleccionada (de la navegación)
   - **Carrera(s)**: Seleccionar al menos una carrera
   - **Archivo**: Hacer clic y seleccionar archivo (PDF, Word, Excel, imagen, etc.)

3. Hacer clic en **"Subir Documento"**

### 5. Observar el Progreso

Verás notificaciones toast indicando:
1. 📁 "Creando estructura de carpetas en Google Drive..."
2. 📄 "Subiendo archivo a Google Drive..."
3. ✅ "Documento probatorio creado y subido exitosamente"

También verás:
- Barra de progreso visual: 0% → 25% → 50% → 100%
- Porcentaje numérico
- Mensaje "Subiendo archivo..."

### 6. Verificar en Google Drive

1. Abrir **Google Drive** de la cuenta con la que te autenticaste
2. Buscar carpeta: **"SINAES - Gestión de Calidad"**
3. Navegar la jerarquía de carpetas creadas
4. Verificar que el archivo esté en la ubicación correcta

**Estructura esperada:**
```
SINAES - Gestión de Calidad/
  DIM01 - Gestión Institucional/
    COMP01 - Planificación Estratégica/
      CRIT01 - [Criterio]/
        STD01 - [Estándar]/
          EV01 - [Evidencia]/
            CAR001 - [Carrera]/
              tu-archivo.pdf
```

### 7. Verificar en la Base de Datos

El registro del documento debería incluir:
- `fileUrl`: URL del archivo en Google Drive
- `fileName`: Nombre del archivo
- `fileType`: Tipo MIME del archivo
- `fileSize`: Tamaño en bytes
- `googleDriveFileId`: ID del archivo en Drive
- `googleDriveFolderId`: ID de la carpeta en Drive

## Casos de Error a Probar

### Caso 1: Usuario No Admin
**Acción:** Intentar subir archivo con usuario sin rol 'admin'  
**Resultado esperado:** Toast rojo: "Only administrators can manage SINAES documents"

### Caso 2: Sin Token de Google
**Acción:** Intentar subir después de que expire el token (o borrarlo manualmente)  
**Resultado esperado:** Toast rojo: "You must be logged in with Google to use this feature. Please log out and log in again with Google."  
**Solución:** Cerrar sesión y volver a autenticarse con Google

### Caso 3: Jerarquía Incompleta
**Acción:** Intentar subir sin seleccionar toda la jerarquía  
**Resultado esperado:** Toast rojo: "Debe seleccionar la jerarquía completa (Dimensión → Componente → Criterio → Estándar → Evidencia)"

### Caso 4: Sin Carrera Seleccionada
**Acción:** Intentar subir sin seleccionar ninguna carrera  
**Resultado esperado:** Toast rojo: "Debe seleccionar al menos una carrera"

### Caso 5: Sin Archivo
**Acción:** Intentar enviar formulario sin seleccionar archivo  
**Resultado esperado:** Error de validación: "Debe seleccionar un archivo"

## Debugging

### Ver logs en consola del navegador
```javascript
// Verás logs como:
📁 Folder created: { id: "...", name: "...", ... }
📄 File uploaded: { id: "...", url: "...", ... }
```

### Ver logs en consola del backend
```
[GoogleDriveController] Validating Google Drive access for user: ...
[GoogleDriveService] Creating folder structure...
[GoogleDriveService] Root folder exists: 1abc...xyz
[GoogleDriveService] Uploading file to folder: 1def...uvw
```

### Verificar estado de autenticación
```javascript
// En consola del navegador:
fetch('http://localhost:3001/api/v1/google-drive/test', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)

// Debería retornar:
// { user: { email, name, ... }, accessToken: "ya29..." }
```

## Solución de Problemas Comunes

### "You must be logged in with Google..."
**Causa:** Token de Google expirado o no disponible  
**Solución:** 
1. Cerrar sesión: Click en "Logout"
2. Iniciar sesión nuevamente con "Login with Google"
3. Aceptar permisos de Drive cuando se soliciten

### "Only administrators can manage SINAES documents"
**Causa:** Usuario no tiene rol 'admin'  
**Solución:** 
1. Pedir a admin que asigne rol
2. O en desarrollo, actualizar directamente en BD:
   ```sql
   UPDATE user_roles SET role_id = (SELECT id FROM roles WHERE name = 'admin') WHERE user_id = 'tu-user-id';
   ```

### Carpetas no se crean en Drive
**Causa:** Scopes de OAuth2 incorrectos  
**Solución:** 
1. Verificar en backend `google-strategy.ts` tiene scope: `'https://www.googleapis.com/auth/drive.file'`
2. Revocar acceso en Google: https://myaccount.google.com/permissions
3. Volver a autenticarse para solicitar nuevos permisos

### Archivo no aparece en Drive
**Causa:** Puede ser que se haya subido a una carpeta diferente  
**Solución:** 
1. En Google Drive, buscar por nombre del archivo
2. Verificar `googleDriveFileId` en la BD
3. Abrir directamente: `https://drive.google.com/file/d/{googleDriveFileId}/view`

## Comandos Útiles

### Limpiar tokens de prueba en BD (MongoDB)
```javascript
db.users.updateMany({}, { $unset: { googleAccessToken: "", googleRefreshToken: "" } })
```

### Ver documentos creados
```javascript
db.proof_documents.find({ googleDriveFileId: { $exists: true } }).pretty()
```

### Resetear todo y empezar de cero
1. Revocar acceso en Google: https://myaccount.google.com/permissions
2. Limpiar tokens en BD (comando arriba)
3. Cerrar sesión en la app
4. Iniciar sesión nuevamente con Google

## Checklist de Testing Completo

- [ ] Usuario admin puede autenticarse con Google exitosamente
- [ ] Permisos de Drive son solicitados y aceptados
- [ ] Estructura de carpetas se crea en Drive del admin
- [ ] Archivo se sube correctamente
- [ ] Progreso visual funciona (0% → 25% → 50% → 100%)
- [ ] Toasts informativos se muestran en cada paso
- [ ] Registro en BD se crea con todos los metadatos
- [ ] Archivo es visible en Google Drive del admin
- [ ] Usuario no-admin recibe error 403
- [ ] Usuario sin token de Google recibe error 401
- [ ] Validaciones de formulario funcionan
- [ ] Múltiples archivos pueden subirse consecutivamente
- [ ] Archivos de diferentes tipos (PDF, Word, Excel, imagen) funcionan

---

**¡Listo!** 🎉 Si todos los pasos funcionan correctamente, la integración está completa.
