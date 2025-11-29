# Google Drive Frontend Integration

## Resumen

Integración completa del frontend con el backend OAuth2 de Google Drive para la subida de archivos del módulo SINAES.

## Cambios Realizados

### 1. Servicios Actualizados

#### `google-drive.service.ts`
- ✅ **Interfaces actualizadas** para coincidir con el backend:
  - `FolderStructure`: Ahora requiere códigos Y nombres para todos los niveles
  - `DriveFolder`: Simplificado con `rootFolderId`
  
- ✅ **Manejo de errores OAuth2**:
  - Detecta respuestas 401 (no autenticado)
  - Lanza errores descriptivos: "You must be logged in with Google to use this feature. Please log out and log in again with Google."
  
- ✅ **Métodos principales**:
  - `createFolderStructure()`: Crea jerarquía de 6 niveles en Google Drive
  - `uploadFile()`: Sube archivo al folder correcto
  - Ambos con manejo de errores OAuth2

#### `integrated-proof-documents.service.ts`
- ✅ **Método `createWithFile()` actualizado**:
  - Acepta jerarquía completa (dimension, component, criterion, standard, evidence, career)
  - Cada nivel incluye `code` y `name`
  - Pasa toda la información al servicio de Google Drive
  - Guarda metadatos en BD: `fileUrl`, `fileName`, `fileType`, `fileSize`, `googleDriveFileId`, `googleDriveFolderId`

### 2. Custom Hooks

#### `use-google-drive-upload.ts` (NUEVO)
- ✅ **Hook personalizado** para workflow de subida:
  - Maneja estado de carga (`isUploading`)
  - Tracking de progreso (`uploadProgress`): 0% → 25% → 50% → 100%
  - Notificaciones toast en cada paso
  
- ✅ **Función `uploadToGoogleDrive()`**:
  - **Paso 1** (0-50%): Crea estructura de carpetas en Google Drive del admin
  - **Paso 2** (50-100%): Sube archivo al folder creado
  
- ✅ **Manejo de errores categorizado**:
  - **OAuth errors** (401): "You must be logged in with Google..."
  - **Admin permission errors** (403): "Only administrators can manage SINAES documents"
  - **Errores generales**: Mensaje de error específico

- ✅ **Retorna `GoogleDriveUploadResult`**:
  ```typescript
  {
    fileId: string
    fileUrl: string
    folderId: string
    fileName: string
    fileSize: number
    mimeType: string
  }
  ```

### 3. Componentes Actualizados

#### `upload-documents-tab.tsx`
- ✅ **Importa y usa `useGoogleDriveUpload()`**
- ✅ **Validaciones completas**:
  - Verifica jerarquía completa seleccionada (Dimensión → Componente → Criterio → Estándar → Evidencia)
  - Verifica al menos una carrera seleccionada
  - Obtiene información completa de la carrera (código y nombre)
  
- ✅ **Workflow de subida**:
  1. Obtiene datos de carrera desde API
  2. Prepara `folderStructure` con los 12 campos requeridos (6 niveles × 2 propiedades cada uno)
  3. Llama a `uploadToGoogleDrive()` con progreso
  4. Crea registro en BD con metadatos de Google Drive
  5. Muestra toast de éxito con nombre del archivo
  
- ✅ **Pasa `uploadProgress` al formulario** para visualización

#### `simple-proof-document-form.tsx`
- ✅ **Acepta prop `uploadProgress?: number`**
- ✅ **Muestra barra de progreso** cuando `isSubmitting && uploadProgress !== undefined`:
  - Porcentaje visual
  - Barra animada con transición suave
  - Mensaje "Subiendo archivo..."
- ✅ **Deshabilita botón "Limpiar"** durante subida

#### `google-auth-banner.tsx` (NUEVO)
- ⚠️ **Componente preparado** pero no activo por ahora
- El backend ya maneja validación de OAuth2 y retorna errores descriptivos
- El frontend los captura y muestra vía toast
- Banner podría activarse en el futuro si se necesita detección proactiva

## Flujo Completo de Subida

```
[Usuario selecciona archivo]
      ↓
[Valida jerarquía completa]
      ↓
[Obtiene info de carrera: code y name]
      ↓
[useGoogleDriveUpload hook inicia]
      ↓
PASO 1: Crear estructura de carpetas (0% → 50%)
      ↓
  Backend valida:
  - Usuario autenticado con Google
  - Usuario tiene rol 'admin'
  - GoogleAccessToken disponible
      ↓
  Crea estructura en Drive del admin:
  SINAES - Gestión de Calidad/
    DIM01 - Dimensión/
      COMP01 - Componente/
        CRIT01 - Criterio/
          STD01 - Estándar/
            EV01 - Evidencia/
              CAR001 - Carrera/
      ↓
PASO 2: Subir archivo (50% → 100%)
      ↓
  Archivo almacenado en folder correcto
      ↓
[Crear registro en BD]
      ↓
  Guarda:
  - Metadatos del archivo
  - IDs de Google Drive (file y folder)
  - URL pública
  - Asociación con evidencia
  - Asociación con carrera(s)
      ↓
[Toast de éxito]
```

## Estructura de Carpetas en Google Drive

```
📁 SINAES - Gestión de Calidad (raíz, creada automáticamente)
   └─ 📁 DIM01 - Gestión Institucional
      └─ 📁 COMP01 - Planificación Estratégica
         └─ 📁 CRIT01 - Planes de Desarrollo
            └─ 📁 STD01 - Plan Institucional
               └─ 📁 EV01 - Documentos de Planificación
                  └─ 📁 CAR001 - Ingeniería en Sistemas
                     └─ 📄 convenio-universidad-x.pdf
```

**Características:**
- ✅ Carpetas nombradas con: `{code} - {name}`
- ✅ Jerarquía de 6 niveles
- ✅ Creación automática si no existen
- ✅ Almacenadas en Google Drive personal del admin
- ✅ Solo el admin (quien se autentica con Google) puede crear/ver/gestionar

## Datos Requeridos por el Frontend

Para subir un archivo, el frontend DEBE proporcionar:

```typescript
{
  file: File,
  folderStructure: {
    dimensionCode: string,    // Ej: "DIM01"
    dimensionName: string,    // Ej: "Gestión Institucional"
    componentCode: string,    // Ej: "COMP01"
    componentName: string,    // Ej: "Planificación Estratégica"
    criterionCode: string,    // Ej: "CRIT01"
    criterionName: string,    // Ej: "Planes de Desarrollo"
    standardCode: string,     // Ej: "STD01"
    standardName: string,     // Ej: "Plan Institucional"
    evidenceCode: string,     // Ej: "EV01"
    evidenceName: string,     // Ej: "Documentos de Planificación"
    careerCode: string,       // Ej: "CAR001"
    careerName: string        // Ej: "Ingeniería en Sistemas"
  }
}
```

**⚠️ Importante:** Todos los 12 campos son requeridos (6 niveles × 2 propiedades).

## Manejo de Errores

### Errores OAuth2 (401)
```typescript
"You must be logged in with Google to use this feature. 
Please log out and log in again with Google."
```
**Solución:** Usuario debe cerrar sesión y volver a autenticarse con Google para aceptar permisos de Drive.

### Errores de Permisos (403)
```typescript
"Only administrators can manage SINAES documents"
```
**Solución:** Solo usuarios con rol 'admin' pueden subir documentos.

### Errores Generales
```typescript
toast.error('Error al crear el documento probatorio', {
  description: error.message
})
```

## Próximos Pasos (Opcional)

### Mejoras Pendientes:
1. **Múltiples carreras**: Actualmente usa solo la primera carrera para la estructura de carpetas
2. **Token persistence**: Los tokens de Google están en memoria (sesión), podrían guardarse en BD
3. **Token refresh**: Implementar refresh automático cuando `accessToken` expira
4. **Banner proactivo**: Activar `GoogleAuthBanner` para detectar falta de token antes de intentar subir
5. **Progreso real**: El progreso actual es simulado (25%, 50%, 100%), podría ser real del API

### Testing Recomendado:
- [ ] Usuario admin se autentica con Google (primera vez)
- [ ] Usuario admin sube archivo exitosamente
- [ ] Verificar estructura de carpetas en Google Drive del admin
- [ ] Verificar archivo en carpeta correcta
- [ ] Verificar registro en BD con metadatos correctos
- [ ] Usuario no-admin intenta subir (debe fallar con 403)
- [ ] Usuario admin sin token de Google intenta subir (debe fallar con 401)
- [ ] Usuario admin re-autentica después de token expirado

## Componentes Clave

| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `google-drive.service.ts` | Cliente API para backend de Google Drive | ✅ Completado |
| `use-google-drive-upload.ts` | Hook con lógica de upload y progreso | ✅ Completado |
| `upload-documents-tab.tsx` | Orquesta workflow completo de subida | ✅ Completado |
| `simple-proof-document-form.tsx` | UI del formulario con barra de progreso | ✅ Completado |
| `integrated-proof-documents.service.ts` | Servicio de documentos con Google Drive | ✅ Completado |
| `google-auth-banner.tsx` | Banner de re-autenticación (opcional) | ⏸️ Preparado |

## Configuración Requerida

### Variables de Entorno (Backend)
```env
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
```

### Variables de Entorno (Frontend)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Scopes de Google OAuth2
```typescript
[
  'email',
  'profile',
  'https://www.googleapis.com/auth/drive.file'
]
```

**Nota:** `drive.file` scope solo permite acceso a archivos creados por la aplicación (seguridad).

## Conclusión

✅ **Frontend completamente integrado** con backend OAuth2 de Google Drive  
✅ **Workflow funcional** de subida con progreso visual  
✅ **Manejo robusto de errores** OAuth2 y permisos  
✅ **UI intuitiva** con notificaciones toast  
✅ **Preparado para producción** (con testing recomendado)

---

**Última actualización:** ${new Date().toISOString()}
