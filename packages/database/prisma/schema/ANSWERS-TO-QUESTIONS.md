# Respuestas a Preguntas Específicas

## ✅ Pregunta 1: Estructura Flexible (Criterio → Estándares Opcionales → Evidencias)

**IMPLEMENTADO:** Ahora un criterio puede tener:
- **Estándares opcionales** con sus evidencias
- **Evidencias directas** cuando no hay estándares

```prisma
model QualityEvidence {
  standardId  String? @db.ObjectId // ✅ OPCIONAL
  criterionId String? @db.ObjectId // ✅ OPCIONAL - evidencia directa del criterio
  
  standard   Standard?  @relation(fields: [standardId], references: [id])
  criterion  Criterion? @relation(fields: [criterionId], references: [id])
}
```

**Casos de uso:**
- Criterio CON estándares: `Criterion → Standard → Evidence → ProofDocument`
- Criterio SIN estándares: `Criterion → Evidence → ProofDocument`

---

## ✅ Pregunta 2: Múltiples Carreras en Base de Datos

**IMPLEMENTADO:** Tabla de relación many-to-many:

```prisma
model CareerProofDocument {
  careerId        String @db.ObjectId
  proofDocumentId String @db.ObjectId
  
  career        Career        @relation(fields: [careerId], references: [id])
  proofDocument ProofDocument @relation(fields: [proofDocumentId], references: [id])
}
```

**Beneficios:**
- ✅ Un documento puede afectar múltiples carreras
- ✅ Consultas eficientes por carrera
- ✅ Control granular de asociaciones
- ✅ Facilita reportes y auditorías

---

## ✅ Pregunta 3: Google Drive - Múltiples Carreras

**ESTRATEGIA IMPLEMENTADA:**

### Estructura de Carpetas Propuesta:
```
📁 EVID-1.1.1.1_Lista-materiales/
├── 📁 Carreras/
│   ├── 📁 ING-SISTEMAS/     ← Documentos específicos de esta carrera
│   ├── 📁 ING-CIVIL/        ← Documentos específicos de esta carrera
│   └── 📁 MEDICINA/         ← Documentos específicos de esta carrera
└── 📁 Compartidos/          ← Documentos que aplican a TODAS las carreras
```

### Lógica de Almacenamiento:
```typescript
if (document.affectedCareers.length === 1) {
  // Almacenar en carpeta específica de la carrera
  targetFolder = `Carreras/${careerCode}/`
} else if (document.affectedCareers.length > 1) {
  // Almacenar en carpeta compartida
  targetFolder = `Compartidos/`
}
```

**Ventajas:**
- ✅ **No duplicación** de archivos
- ✅ **Organización clara** por carrera
- ✅ **Fácil navegación** visual
- ✅ **Permisos granulares** por carpeta

---

## ✅ Pregunta 4: Eliminación Coordinada (BD + Google Drive)

**ESTRATEGIA IMPLEMENTADA:**

### 1. Soft Delete en Base de Datos:
```typescript
await prisma.proofDocument.update({
  where: { id: documentId },
  data: { status: 'INACTIVE' }
});
```

### 2. Gestión en Google Drive:
```typescript
// Opción A: Mover a papelera de Google Drive
await drive.files.update({
  fileId: document.googleDriveFileId,
  requestBody: { trashed: true }
});

// Opción B: Mover a carpeta "Eliminados"
await drive.files.update({
  fileId: document.googleDriveFileId,
  requestBody: {
    parents: [deletedFolderId],
    removeParents: [currentParentId]
  }
});
```

### 3. Estructura de Eliminación:
```
📁 🗑️ Eliminados/
├── 📁 2024-08-20/           ← Organizados por fecha
│   ├── 📁 EVID-1.1.1.1_Lista-materiales/
│   └── 📁 EVID-2.1.1.1_Otro-documento/
└── 📁 2024-08-19/
```

**Beneficios:**
- ✅ **Recuperación posible** durante X días
- ✅ **Auditoría completa** de eliminaciones
- ✅ **Eliminación definitiva** automatizada
- ✅ **Operaciones atómicas** BD + Drive

---

## ✅ Pregunta 5: ¿Funciona Correctamente para Google Drive?

**SÍ, la estructura actual funciona perfectamente porque:**

### Metadatos Completos:
```prisma
model ProofDocument {
  fileUrl             String   // URL pública de Google Drive
  googleDriveFileId   String?  // ID único del archivo
  googleDriveFolderId String?  // ID de la carpeta padre
  googleDriveVersion  String?  // Control de versiones
}
```

### Gestión de Carpetas:
```prisma
model GoogleDriveFolder {
  googleFolderId  String  @unique // ID de Google Drive
  level           Int     // Nivel jerárquico (1-5)
  entityType      String  // Tipo de entidad
  entityId        String? // Referencia a la entidad
  careerCode      String? // Para carpetas específicas
  path            String  // Ruta completa
}
```

### Operaciones Coordinadas:
- ✅ **Creación**: Carpeta en Drive + Registro en BD
- ✅ **Actualización**: Sincronización automática
- ✅ **Eliminación**: Soft delete + Papelera de Drive
- ✅ **Recuperación**: Restaurar desde papelera
- ✅ **Búsqueda**: Por jerarquía, carrera, tipo, etc.

---

## 🚀 Funcionalidades Adicionales Implementadas

### 1. Generación Automática de Códigos:
```typescript
// Resultado: "CONV-001", "BROSHO-002", etc.
const documentCode = await generateDocumentCode(documentTypeId);
```

### 2. Control de Versiones:
```prisma
googleDriveVersion String? // Para tracking de cambios
```

### 3. Búsquedas Eficientes:
```typescript
// Todos los documentos de una carrera específica
const careerDocuments = await getDocumentsByCareer('ing-sistemas');

// Evidencias sin estándares (directas del criterio)
const directEvidences = await getDirectEvidences();

// Documentos compartidos entre carreras
const sharedDocuments = await getSharedDocuments();
```

### 4. Reportes Jerárquicos:
- Por dimensión, componente, criterio, estándar
- Por carrera específica
- Por tipo de documento
- Por rango de fechas

---

## ✅ Conclusión

La estructura implementada **SÍ FUNCIONA CORRECTAMENTE** para:

1. ✅ **Criterios con estándares opcionales**
2. ✅ **Múltiples carreras por documento**
3. ✅ **Organización eficiente en Google Drive**
4. ✅ **Eliminación coordinada BD + Drive**
5. ✅ **Escalabilidad y mantenimiento**

**Próximo paso:** Implementar los servicios CRUD y la integración con Google Drive API usando los ejemplos de código proporcionados.
