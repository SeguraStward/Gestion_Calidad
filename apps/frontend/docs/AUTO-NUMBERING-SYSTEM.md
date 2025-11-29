# Sistema de Numeración Automática SINAES

## 📋 Descripción General

El sistema de numeración automática genera códigos únicos para cada entidad de la jerarquía SINAES. Los códigos incluyen un prefijo identificador y un número secuencial con padding de ceros.

---

## 🔢 Formato de Códigos

### Dimensiones
- **Formato:** `DIM-XX`
- **Ejemplos:** `DIM-01`, `DIM-02`, `DIM-03`, ..., `DIM-99`
- **Padding:** 2 dígitos
- **Rango:** 01-99 (hasta 99 dimensiones)

### Componentes
- **Formato:** `COMP-XX`
- **Ejemplos:** `COMP-01`, `COMP-02`, `COMP-03`, ..., `COMP-99`
- **Padding:** 2 dígitos
- **Rango:** 01-99 (hasta 99 componentes por dimensión)

### Criterios
- **Formato:** `CRIT-XX`
- **Ejemplos:** `CRIT-01`, `CRIT-02`, `CRIT-03`, ..., `CRIT-99`
- **Padding:** 2 dígitos
- **Rango:** 01-99 (hasta 99 criterios por componente)

### Estándares
- **Formato:** `STD-XX`
- **Ejemplos:** `STD-01`, `STD-02`, `STD-03`, ..., `STD-99`
- **Padding:** 2 dígitos
- **Rango:** 01-99 (hasta 99 estándares por criterio)

### Evidencias de Calidad
- **Formato:** `EV-XXX`
- **Ejemplos:** `EV-001`, `EV-002`, `EV-003`, ..., `EV-999`
- **Padding:** 3 dígitos (pueden ser muchas evidencias)
- **Rango:** 001-999 (hasta 999 evidencias globales)
- **Nota:** La numeración de evidencias es **GLOBAL**, no jerárquica

---

## 🌳 Ejemplo de Jerarquía Completa

```
📁 DIM-01 - Información y Análisis
  │
  ├─ 📁 COMP-01 - Gestión de la Información
  │   │
  │   ├─ 📁 CRIT-01 - Disponibilidad de Información
  │   │   │
  │   │   ├─ 📋 STD-01 - Sistemas de Información Institucional
  │   │   │   ├─ 📄 EV-001 - Dashboard de Indicadores
  │   │   │   ├─ 📄 EV-002 - Reportes Mensuales
  │   │   │   └─ 📄 EV-003 - Base de Datos Centralizada
  │   │   │
  │   │   └─ 📋 STD-02 - Acceso a la Información
  │   │       ├─ 📄 EV-004 - Portal Web Institucional
  │   │       └─ 📄 EV-005 - Sistema de Consultas
  │   │
  │   └─ 📁 CRIT-02 - Calidad de los Datos
  │       │
  │       └─ 📋 STD-03 - Validación de Datos
  │           ├─ 📄 EV-006 - Procedimiento de Validación
  │           └─ 📄 EV-007 - Manual de Calidad de Datos
  │
  └─ 📁 COMP-02 - Análisis de Información
      │
      └─ 📁 CRIT-03 - Análisis Estadístico
          │
          └─ 📋 STD-04 - Herramientas de Análisis
              ├─ 📄 EV-008 - Software Estadístico
              └─ 📄 EV-009 - Capacitaciones en Análisis

📁 DIM-02 - Recursos
  │
  └─ 📁 COMP-03 - Recursos Humanos
      │
      └─ 📁 CRIT-04 - Personal Docente
          │
          └─ 📋 STD-05 - Formación del Personal
              ├─ 📄 EV-010 - Títulos Académicos
              └─ 📄 EV-011 - Certificaciones
```

---

## 🔄 Flujo de Generación

### 1. Usuario Crea Nueva Entidad

```typescript
// Frontend: dimension-form.tsx
useEffect(() => {
  if (!dimension) {
    // Modo creación: auto-generar código
    const generateCode = async () => {
      const nextCode = await autoNumberingService.generateNextDimensionNumber()
      // nextCode = "DIM-01", "DIM-02", etc.
      setFormData({ ...formData, code: nextCode })
    }
    generateCode()
  }
}, [dimension])
```

### 2. Servicio Obtiene Entidades Existentes

```typescript
// auto-numbering.service.ts
private async generateDimensionNumber(): Promise<NumberingResult> {
  // 1. Obtener todas las dimensiones
  const response = await HttpClient.get('/dimensions')
  const dimensions = response.data?.data || []
  
  // 2. Encontrar el orden máximo
  const maxOrder = dimensions.reduce((max, dim) => 
    Math.max(max, dim.order || 0), 0)
  
  // 3. Calcular siguiente orden
  const nextOrder = maxOrder + 1
  
  // 4. Generar código con prefijo y padding
  return {
    code: `DIM-${nextOrder.toString().padStart(2, '0')}`,
    order: nextOrder
  }
}
```

### 3. Código se Asigna al Formulario

El usuario ve el código generado automáticamente en el campo "Código":

```
┌─────────────────────────────────┐
│  Nueva Dimensión                │
├─────────────────────────────────┤
│  Código: DIM-03 [auto]          │
│  Nombre: [________________]     │
│  Descripción: [___________]     │
│  Orden: 3                       │
│                                 │
│  [Cancelar]  [Crear]            │
└─────────────────────────────────┘
```

---

## 📊 Tabla de Comparación (Antes vs Después)

| Entidad | ❌ Antes (Jerárquico) | ✅ Ahora (Con Prefijo) |
|---------|----------------------|------------------------|
| Dimensión 1 | `1` | `DIM-01` |
| Dimensión 2 | `2` | `DIM-02` |
| Componente 1.1 | `1.1` | `COMP-01` |
| Componente 1.2 | `1.2` | `COMP-02` |
| Componente 2.1 | `2.1` | `COMP-03` |
| Criterio 1.1.1 | `1.1.1` | `CRIT-01` |
| Criterio 1.1.2 | `1.1.2` | `CRIT-02` |
| Estándar 1.1.1.1 | `1.1.1.1` | `STD-01` |
| Estándar 1.1.1.2 | `1.1.1.2` | `STD-02` |
| Evidencia 1 | `1` | `EV-001` |
| Evidencia 2 | `2` | `EV-002` |

---

## ✅ Ventajas del Nuevo Sistema

### 1. **Claridad Visual**
```
❌ Antes: "1.1.1.2" - ¿Es un estándar o criterio?
✅ Ahora: "STD-02" - Claramente es un estándar
```

### 2. **Independencia de Jerarquía**
```
❌ Antes: Si eliminas DIM-01, todos los códigos cambian (1.1 → 2.1)
✅ Ahora: COMP-01 sigue siendo COMP-01 sin importar su padre
```

### 3. **Fácil Búsqueda**
```
✅ Buscar "STD-" encuentra todos los estándares
✅ Buscar "EV-" encuentra todas las evidencias
✅ Filtrado por tipo más sencillo
```

### 4. **Mejor Mantenimiento**
```
✅ Códigos no cambian al reorganizar jerarquía
✅ No necesitas recalcular códigos hijos
✅ Referencias estables en documentos y reportes
```

### 5. **Escalabilidad**
```
✅ Hasta 99 dimensiones (DIM-01 a DIM-99)
✅ Hasta 99 componentes por dimensión
✅ Hasta 999 evidencias globales (EV-001 a EV-999)
```

---

## 🛠️ Implementación Técnica

### Servicio de Auto-numeración

**Archivo:** `services/auto-numbering.service.ts`

```typescript
class AutoNumberingService {
  // Dimensiones: DIM-01, DIM-02...
  async generateNextDimensionNumber(): Promise<string> {
    const result = await this.generateDimensionNumber()
    return result.code
  }

  // Componentes: COMP-01, COMP-02...
  async generateNextComponentNumber(dimensionId: string): Promise<string> {
    const result = await this.generateComponentNumber(dimensionId)
    return result.code
  }

  // Criterios: CRIT-01, CRIT-02...
  async generateNextCriterionNumber(componentId: string): Promise<string> {
    const result = await this.generateCriterionNumber(componentId)
    return result.code
  }

  // Estándares: STD-01, STD-02...
  async generateNextStandardNumber(criterionId: string): Promise<string> {
    const result = await this.generateStandardNumber(criterionId)
    return result.code
  }

  // Evidencias: EV-001, EV-002... (global)
  async generateNextEvidenceNumber(): Promise<string> {
    const result = await this.generateEvidenceNumber()
    return result.code
  }

  private async generateDimensionNumber(): Promise<NumberingResult> {
    const response = await HttpClient.get('/dimensions')
    const dimensions = response.data?.data || []
    const maxOrder = dimensions.reduce((max, dim) => Math.max(max, dim.order || 0), 0)
    const nextOrder = maxOrder + 1

    return {
      code: `DIM-${nextOrder.toString().padStart(2, '0')}`,
      order: nextOrder
    }
  }

  // ... similar para otros métodos
}
```

### Uso en Formularios

```tsx
// dimension-form.tsx
export const DimensionForm = ({ dimension }) => {
  const [formData, setFormData] = useState({ code: '', name: '', ... })

  useEffect(() => {
    if (!dimension) {
      // Solo auto-generar para nuevas entidades
      const generateCode = async () => {
        const nextCode = await autoNumberingService.generateNextDimensionNumber()
        setFormData({ ...formData, code: nextCode })
      }
      generateCode()
    } else {
      // Modo edición: usar código existente
      setFormData({ ...dimension })
    }
  }, [dimension])

  // ... resto del componente
}
```

---

## 🧪 Ejemplos de Uso

### Crear Dimensión

```typescript
const dimension = await dimensionsService.create({
  code: 'DIM-01',  // Auto-generado
  name: 'Información y Análisis',
  description: '...',
  order: 1
})
```

### Crear Componente

```typescript
const component = await componentsService.create({
  code: 'COMP-01',  // Auto-generado (independiente del padre)
  name: 'Gestión de la Información',
  dimensionId: 'xxx',
  order: 1
})
```

### Crear Evidencia

```typescript
const evidence = await qualityEvidencesService.create({
  code: 'EV-001',  // Auto-generado (numeración global)
  name: 'Dashboard de Indicadores',
  standardId: 'xxx',
  order: 1
})
```

---

## 🔍 Búsqueda y Filtrado

### Por Prefijo

```typescript
// Buscar todas las dimensiones
const dimensions = await search({ code: { startsWith: 'DIM-' } })

// Buscar todos los estándares
const standards = await search({ code: { startsWith: 'STD-' } })

// Buscar evidencias
const evidences = await search({ code: { startsWith: 'EV-' } })
```

### Por Rango

```typescript
// Dimensiones del 01 al 10
const dimensions = await search({ 
  code: { gte: 'DIM-01', lte: 'DIM-10' } 
})

// Evidencias del 001 al 100
const evidences = await search({ 
  code: { gte: 'EV-001', lte: 'EV-100' } 
})
```

---

## 📝 Validaciones

### 1. Código Único

```typescript
async isCodeUnique(code: string, entityType: string): Promise<boolean> {
  const response = await HttpClient.get(`/${entityType}`, {
    params: { code }
  })
  return response.data.data.length === 0
}
```

### 2. Formato Correcto

```typescript
const codePatterns = {
  dimension: /^DIM-\d{2}$/,      // DIM-01
  component: /^COMP-\d{2}$/,     // COMP-01
  criterion: /^CRIT-\d{2}$/,     // CRIT-01
  standard: /^STD-\d{2}$/,       // STD-01
  evidence: /^EV-\d{3}$/         // EV-001
}

function validateCode(code: string, type: string): boolean {
  return codePatterns[type].test(code)
}
```

---

## 🚀 Migración desde Sistema Anterior

Si tienes códigos antiguos sin prefijo, puedes migrarlos:

```typescript
// Script de migración (ejemplo)
async function migrateCodes() {
  // Dimensiones: 1 → DIM-01
  const dimensions = await dimensionsService.findAll()
  for (const dim of dimensions) {
    if (!dim.code.startsWith('DIM-')) {
      await dimensionsService.update(dim.id, {
        code: `DIM-${dim.code.padStart(2, '0')}`
      })
    }
  }

  // Similar para otras entidades...
}
```

---

## 📚 Referencias

- **Servicio:** `services/auto-numbering.service.ts`
- **Hook:** `hooks/use-auto-numbering.ts`
- **Documentación Backend:** `apps/backend/Docs/SINAES-MODULE.md`
- **Documentación Frontend:** `apps/frontend/docs/SINAES-MODULE-FRONTEND.md`

---

**Última actualización:** Octubre 2, 2025  
**Versión:** 2.0.0 (Sistema con prefijos)  
**Mantenedor:** Sistema de Gestión de Calidad - UNA
